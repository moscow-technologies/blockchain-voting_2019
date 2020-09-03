/*!
 * Lingua_Stem_Ru v0.7
 * 
 * 
 * Copyright 2011, Mark Prisyazhnyuk (nixmrak)
 * Licensed under GPL Version 2 licenses.
 * 
 * Usage:
 * 
 * var stem = new Lingua_Stem_Ru
 * console.log(stem.stem_word('длительный'))
 * 
 */


var StringRef = function (v){
	this.val = v.toString()
}
StringRef.prototype={
	toString: function () {
		return this.val
	}
}

var Lingua_Stem_Ru = function () {
    this.VERSION = '0.7'
    this.Stem_Caching = 0
    this.Stem_Cache = []
    this.VOWEL = /аеиоуыэюя/
    
    this.REFLEXIVE = /(с[яь])$/
    this.ADJECTIVE = /(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|еых|ую|юю|ая|яя|ою|ею)$/
    this.NOUN = /(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|ией|ей|ой|ий|й|и|ы|ь|ию|ью|ю|ия|ья|я)$/
    this.RVRE = /^(.*?[аеиоуыэюя])(.*)$/
    this.DERIVATIONAL = /[^аеиоуыэюя][аеиоуыэюя]+[^аеиоуыэюя]+[аеиоуыэюя].*ость?$/
	
	
}

Lingua_Stem_Ru.prototype = {
	s : function (strRef, re, to) {
		var orig = strRef.val
		strRef.val = strRef.val.replace(re, to)
		return (orig !== strRef.val)
	}
	,
    m : function (strRef, re) {
        return strRef.val.match(re);
    }
    ,
    PERFECTIVEGROUND_delete : function(str) {
		var GR1 = /(ив|ивши|ившись|ыв|ывши|ывшись)$/
		if(this.s(str, GR1, '')) {
			return true
		}
		var GR2 = /[ая](в|вши|вшись)$/
		var GR2_delete = /(в|вши|вшись)$/
		if(this.m(str, GR2)) {
			if(this.s(str, GR2_delete, '')) {
				return true
			}
		}
		return false
	}
	,
	PARTICIPLE_delete : function (str) {
		var GR1 = /(ивш|ывш|ующ)$/
		if(this.s(str, GR1, '')) {
			return true
		}
		var GR2 = /[ая](ем|нн|вш|ющ|щ)$/
		var GR2_delete = /(ем|нн|вш|ющ|щ)$/
		if(this.m(str, GR2)) {
			if(this.s(str, GR2_delete, '')) {
				return true
			}
		}
		return false
	}
	,
	VERB_delete : function (str) {
		var GR1 = /(ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ены|ить|ыть|ишь|ую|ю)$/
		if(this.s(str, GR1, '')) {
			return true
		}
		var GR2 = /[ая](ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)$/
		var GR2_delete = /(ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)$/
		if(this.m(str, GR2)) {
			if(this.s(str, GR2_delete, '')) {
				return true
			}
		}
		return false
	}
	,
	stem_word : function(str) {
		var p, RV, start, result
		
		str = str.toLowerCase()
		str = str.replace(/ё/g, 'е')
		
		do {
			p = this.RVRE.exec(str)
			start = p[1];
			RV = p[2];
			if (!RV) break;
			
			RV = new StringRef(RV)
	
			//Step 1
			if(!this.PERFECTIVEGROUND_delete(RV)) {
				this.s(RV, this.REFLEXIVE, '')
				if (this.s(RV, this.ADJECTIVE, '')) {
					  this.PARTICIPLE_delete(RV)
				  } else {
					  if (!this.VERB_delete(RV))
						  this.s(RV, this.NOUN, '')
				  }			
			}
			
			//Step 2
			this.s(RV, /и$/, '');
          
			//Step 3
			if (this.m(RV, this.DERIVATIONAL)) {
				this.s(RV, /ость?$/, '')
			}	
			//Step 4
			if (!this.s(RV, /ь$/, '')) {
				this.s(RV, /ейше?/, '')
				this.s(RV, /нн$/, 'н') 
			}			
			result = start+RV
			
		} while (false)
		
		return result
	}
	
}
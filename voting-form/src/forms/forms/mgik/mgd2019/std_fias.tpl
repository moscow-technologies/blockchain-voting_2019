{if !$contact}{assign var=contact value="declarant"}{/if}
{if !$addressType}{assign var=addressType value="1"}{/if}
{if !$filter}{assign var=filter value="none"}{/if}
{if !$type}{assign var=type value="B"}{/if}
{*
filter бывает вида
none -все отображать default
moscowFull - москва+ новая москва
moscowNew -  новая москва только
moscow - старая москва + зеленоград
*}
{*
type бывает вида, требует обязательного заполнения уровня справочника
B - дома - default
S - улицы
*}
{if !$limitRegionsTo}{$limitRegionsTo=[]}{/if}
{if !$skipInit}
    {literal}
    <script type="text/javascript">
        $(document).ready(function() {
            if (typeof (init_fias) === "function")  //инициализируем если есть функция
                init_fias({
                    filter: '{/literal}{$filter}{literal}',
                    type:'{/literal}{$type}{literal}',
                    //limitRegionsTo: {/literal}{$limitRegionsTo|@json_encode}{literal},
                    includeOkato: {/literal}{if $includeOkato}true{else}false{/if}{literal}
                }{/literal}{if $id},$("#{$id}"){/if});
            else console.error('fias.js is unavailable');    
        });
    </script>
   
{/if}

<div class="fias {if $container_class}{$container_class}{/if} " {if ($id!='')}id="{$id}"{/if} data-filter="{$filter}">
    <input type="hidden" value="{$addressType}" name="field[{$contact}.new_address{$addressType}_type]"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_stateorprovince]" class="FederalInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_county]" class="RaionInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_city]" class="CityInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}new_address{$addressType}_town]" class="PlaceInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_line1]" class="StreetInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_line2]" class="HouseInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_property]" class="VladenieInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_litera]" class="LiteraInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_line4]" class="CorpusInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_structure]" class="StroenieInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_postalcode]" class="PostalInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_new_fiasguid]" class="FiasGuidInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_kladr]" class="KladrInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_unom]" class="UnomInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_unad]" class="UnadInput fiasField"/>
    <input type="hidden" value="" name="field[{$contact}.{$new}address{$addressType}_district]" class="DistrictInput fiasField"/>

    <div class="row">
        <div class="col-md-12">
            <div class="row">
                <div class="col-md-8">
                    {include file="$base_template_path/std_blocks/std_text.tpl"
                        label="{if isset($label)}{$label}{else}Адрес дома{/if}"
                        class="fiasInput"
                        text=""
                        id="{$id}_fiasInput"
                        value=false container_class=""
                        validator="notValidClass|Введен&nbsp;неверный&nbsp;адрес{if $type!='S'}&nbsp;с&nbsp;точностью&nbsp;до&nbsp;дома{/if} dictrict|{$allowed_districts}"
                        maxlength="255" name="field[{$contact}.{$new}address{$addressType}_postofficebox]"
                        required=true
                        placeholder="Например, Дмитровская, 15к1"
                        hint="Минимум 3 символа. Пример адреса: Ленинский проспект 4, строение 5"
                    }
                </div>
                <div class="col-md-4">
                    {if !$skipFlat}
                        {include file="$base_template_path/std_blocks/std_text.tpl" label="Квартира" class="FlatInput fiasField" text="" id="{$id}_Flat" value=false container_class="" maxlength="15" name="field[{$contact}.{$new}address{$addressType}_line3]" required=(!empty($validateFlat)) placeholder="Введите квартиру/офис"}
                    {/if}
                </div>
            </div>
        </div>
    </div>

    {*<input type="hidden" name="field[{$contact}.{$new}new_address{$addressType}_new_oktmo]" class="oktmo fiasField"> в регламенте нет такого поля*}
    
    {if $includeOkato}
        <input type="hidden" name="field[{$contact}.{$new}new_address{$addressType}_new_okato]" class="okato fiasField">
    {/if}
</div>
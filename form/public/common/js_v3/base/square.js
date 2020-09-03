function showSquares() {
	$(document).on('ready', function () {
		var countSquare = $("#catalog_squares").find(".square").length;
		if (countSquare > 0) {
			$("#catalog_squares").show();
		}
	});
}
/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"wfprecios/z_sd_aprob_manual_sol/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});

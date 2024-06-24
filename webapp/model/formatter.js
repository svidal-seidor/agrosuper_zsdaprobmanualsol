sap.ui.define([], function() {
	"use strict";
	//Globalizamos

	return {

		
		fechaLocalHoy: function(){


			let dFechaHoy = new Date();
			let sFechaHoy = dFechaHoy.toLocaleDateString();


			let sFechaOrdArr = sFechaHoy.split("/");

			if(sFechaOrdArr[1].length == 1){
			  sFechaOrdArr[1] = "0"+sFechaOrdArr[1];
			}

			if(sFechaOrdArr[0].length == 1){
				sFechaOrdArr[0] = "0"+sFechaOrdArr[0];
			  }

			let sFechaOrdenada = sFechaOrdArr[0]+"-"+sFechaOrdArr[1]+"-"+sFechaOrdArr[2];

			return sFechaOrdenada;
		},

		fechaLocalHoyBD: function(){


			let dFechaHoy = new Date();
			let sFechaHoy = dFechaHoy.toLocaleDateString();


			let sFechaOrdArr = sFechaHoy.split("/");

			if(sFechaOrdArr[1].length == 1){
			  sFechaOrdArr[1] = "0"+sFechaOrdArr[1];
			}

			if(sFechaOrdArr[0].length == 1){
				sFechaOrdArr[0] = "0"+sFechaOrdArr[0];
			  }

			let sFechaOrdenada = sFechaOrdArr[2]+"-"+sFechaOrdArr[1]+"-"+sFechaOrdArr[0];

			return sFechaOrdenada;
		},

		montoDecimal: function(pMonto){

			if(pMonto == "" || pMonto == null){
				return pMonto;
			}
			
			if(pMonto){
				if(pMonto.includes(".")){
					return pMonto.replaceAll(".",",");
				}
			}
			
			return pMonto;
		},

		separadorMiles: function(pMonto){

				if(pMonto == "" || pMonto == null){
					return pMonto;
				}
				return new Intl.NumberFormat("es-CL").format(pMonto);
			
		},
        
		validarFechaCarga: function(pFecha, pHora){

			let obj = {};
			let aFecha = [];

			pFecha = pFecha.replaceAll("/", "-");
			
			if(pFecha.includes("-")){
				aFecha = pFecha.split("-");
			}else if(pFecha.includes("/")){
				aFecha = pFecha.split("/");
			}
			
			let aHora = pHora.split(":");

			//aaaa-mes-dia
			let dFechaReg = new Date(aFecha[2]+"-"+aFecha[1]+"-"+aFecha[0]+" "+aHora[0]+":"+aHora[1]+":"+aHora[2]);
			let dFechaHoy = new Date();
			let sFechaHoy = dFechaHoy.toLocaleDateString();

			let sFechaOrdArr = sFechaHoy.split("/");

			if(sFechaOrdArr[1].length == 1){
			  sFechaOrdArr[1] = "0"+sFechaOrdArr[1];
			}
			let sFechaOrdenada = sFechaOrdArr[0]+"-"+sFechaOrdArr[1]+"-"+sFechaOrdArr[2];
	  

			if(sFechaOrdenada == pFecha){

				obj.error = false;
				obj.mensaje = "";
				obj.valor = dFechaReg;
			}
			else{
				var dif = (dFechaReg - dFechaHoy) / (1000*60*60*24);

		
				if(dif < 0){
					obj.error = true;
					obj.mensaje = "Fecha de carga anterior a la fecha en curso. ";	
	
				}else if(dif > 30){
					
					let dFechaReg2 = new Date(aFecha[2]+"-"+aFecha[1]+"-"+aFecha[0]+" 00:00");
					let dFechaHoy2 = new Date(dFechaHoy.toJSON().substring(0,10) + " 00:00");
	
					dif = (dFechaReg2 - dFechaHoy2) / (1000*60*60*24);
	
					if(dif > 30){
						obj.error = true;
						obj.mensaje = "La fecha de carga excede los 30 días permitidos. ";
					}
				}else{
	
					obj.error = false;
					obj.mensaje = "";
					obj.valor = dFechaReg;
				}
	

			}
			
		
			return obj;


		},

		parseNumero: function(pNumero){
		
			if(!isNaN(pNumero) && pNumero != ""){
				return parseFloat(pNumero, 10);
			}

			return "";
		},

		parseDecimal: function(pNumero){
		
			let pNumerod = pNumero.replace(",",".");
			if(!isNaN(pNumerod) && pNumerod != ""){

				//let pNumerod = pNumero.replace(",",".");
				return parseFloat(pNumerod);
			}

			return "";
		},
		
		dateToBD: function(pFecha){

			let aFechas = pFecha.split("-");
			return aFechas[2]+"-"+aFechas[1]+"-"+aFechas[0];

		},
		fechaHumano: function(pFecha){


			try {
				let sFechaHoy = pFecha.toLocaleDateString();

				let sFechaOrdArr = sFechaHoy.split("/");
	
				if(sFechaOrdArr[1].length == 1){
				  sFechaOrdArr[1] = "0"+sFechaOrdArr[1];
				}
	
				if(sFechaOrdArr[0].length == 1){
					sFechaOrdArr[0] = "0"+sFechaOrdArr[0];
				  }
	
				  
				let sFechaOrdenada = sFechaOrdArr[0]+"-"+sFechaOrdArr[1]+"-"+sFechaOrdArr[2];
	
				return sFechaOrdenada;
			} catch (error) {
				return pFecha;
			}
		

		}
		

		
    }
});
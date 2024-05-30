sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History) {
        "use strict";

        return Controller.extend("wfprecios.zsdaprobmanualsol.controller.Detalle", {
            usuario: "",
            onInit: function () {

                this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRouteMatched, this);

            },

            fnObtenerUsuario: function(){

                this.usuario = "svidal@seidor.com";
  
                if (sap.ushell.Container !== undefined) {
                    let sEmail = sap.ushell.Container.getUser().getEmail();
                    if(sEmail){
                      this.usuario = sEmail.split("@")[0].toUpperCase();
                      this.fnObtenerDatoUsuario();
                    }
                  
                }
               
              },

            _onRouteMatched: function (oEvent) {
                let oArgs = oEvent.getParameter("arguments");
    
                if(oArgs.id_solicitud != undefined){
                    let sIdDctoBtp = oArgs.id_solicitud.replaceAll("'", "");
                    this.fnObtenerUsuario();
                    this.fnObtenerDetalleSolicitud(sIdDctoBtp);
                    
                 //   this.fnCargarValidaciones(sIdDTE);
                }
            },


            onBack: function(){

                    const oHistory = History.getInstance();
                    const sPreviousHash = oHistory.getPreviousHash();
        
                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        const oRouter = this.getOwnerComponent().getRouter();
                        oRouter.navTo("RouteHome", {}, true);
                    
                }
            },
                

            fnObtenerDetalleSolicitud: function(pIdDctoBtp){

                

                let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                let sEntity = "/ZSD_TB_SOL_MAT_DCTO_BTP";
                let that = this;

                var sPath = oModel.createKey("/ZSD_TB_SOL_MAT_DCTO_BTP", {
                    IDDCTOBTP: pIdDctoBtp,
                    IsActiveEntity: true
                });

                let sParameters = {
                    "$expand": "to_Validaciones,to_Detalle,to_Referencias,to_Parametrizaciones,to_EntradaMercancia"
                };

                oModel.read(sPath,{
               //     urlParameters: sParameters,
                    success: function(oReq, oRes){

                        let oDatos = oRes.data;

                        debugger;
                        that.fnObtenerReglaActual(oDatos.FK_ZSD_TB_SECUENC_IDSECUENCIA);


                        let oJsonModel = new sap.ui.model.json.JSONModel(oDatos);
                        that.getView().setModel(oJsonModel, "modeloSolicitud");
                        that.getView().getModel("modeloSolicitud").refresh();

                    },
                    error: function(oError){
                        console.log(oError);
                    }
                });

            },

            fnObtenerReglaActual: function(pIdSecuencia){


                let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                let sEntity = "/ZVINFOMAXREGLA";
                let that = this;

                let aFiltros = [];
                let oFilter = new sap.ui.model.Filter("FK_ZSD_TB_SECUENC_IDSECUENCIA", sap.ui.model.FilterOperator.EQ, pIdSecuencia);
                aFiltros.push(oFilter);
        
                let oFiltroFinal = new sap.ui.model.Filter({ filters: aFiltros, and: false });
        
        

                oModel.read(sEntity,{
                    filters: [oFiltroFinal],
                    success: function(oReq, oRes){
                        let oDatos = oRes.data;

                        debugger;

                        if(oDatos.results.length > 0){
                            
                            let oModel = that.getView().getModel("modeloSolicitud").getData();

                            let sDescSec = oDatos.results[0].DESCRSEC;
                            let aCampos = sDescSec.split("/");
                            let sDescSecDatos = "";
                            aCampos.forEach(element => {
                                sDescSecDatos = sDescSecDatos + oModel[element] + "/";
                            });

                            sDescSecDatos = sDescSecDatos.substring(0,sDescSecDatos.length -1 );

                            let oReglaS =  oDatos.results.filter(obj=>obj.DESCRSECDATOS == sDescSecDatos);

                        
                            if(oReglaS.length > 0){

                                oModel.IDREGLA = oReglaS[0].IDREGLA;
                                let oJsonModel = new sap.ui.model.json.JSONModel(oReglaS[0]);
                                that.getView().setModel(oJsonModel, "modeloReglaActual");
                                that.getView().getModel("modeloReglaActual").refresh();
                            }else{
                                let oJsonModel = new sap.ui.model.json.JSONModel();
                                that.getView().setModel(oJsonModel, "modeloReglaActual");
                                that.getView().getModel("modeloReglaActual").refresh();
                            }
                            


                        }

                       


                     },
                    error: function(oError){
                        console.log(oError);
                    }
                });

  

       

            },

            fnAprobarMasivo: async function(oEvent){

    
                    
                    let oItem = this.getView().getModel("modeloSolicitud").getData();
                    //validar si alguno registro del bloque tiene problemas
                      let sResultado = await this.fnValidarEstadoSolicitud(oItem);
                      if(sResultado != "P"){
                        sap.m.MessageBox.error("Solicitud "+  oItem.PEDIDO + "-"+ oItem.POSPEDIDO +" ya fue evaluada");
                      }else{
                        sap.m.MessageBox.confirm("¿Está seguro que desea aprobar esta solicitud: "+ oItem.PEDIDO + "-"+ oItem.POSPEDIDO  , {
                          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                          emphasizedAction: sap.m.MessageBox.Action.YES,
                          onClose: function (sAction) {
                              if (sAction == "YES"){
          
                                  if(oItem.FK_ZSD_TB_REGLAS_IDREGLA != null && oItem.FK_ZSD_TB_REGLAS_IDREGLA != "" ){
  
                                    if(oItem.CODMOTDERRECH != "006" && oItem.CODMOTDERRECH != null){
                                      sap.m.MessageBox.information("Se aprueba solicitud con UMP Errónea, se debe corregir regla");
                                    }
                                      
                                    //obtener datos de la regla actual segun la secuencia
                                      this.fnProcesarRegistro(oItem);
  
                                  }else{
                                    //se debe solo actualizar el registro no mas en la tabla BTP
                                    let dFecha = new Date().toJSON().substring(0,10);
                                    let aFecha = dFecha.split("-");
                                    let sFecha = aFecha[2]+"-"+aFecha[1]+"-"+aFecha[0];
  
                                    let oHora = new Date().toLocaleTimeString();
  
                                    this.fnActualizarSolicitudBTP(oItem.IDDCTOBTP, "A", sFecha, oHora, null, null, null, null);
                                    this.fnActualizarSolicitudECC(oItem, "A");
                                  }
          
                              }
                              
                          }.bind(this)
                      });
                      }
                
  
              },
  
              fnProcesarRegistro: async function(oItem){
  
                let oRegla = this.getView().getModel("modeloReglaActual").getData();
  
                let iNum1 = parseInt(oItem.CANTIDAD);
                let iNum2 = parseInt(oRegla.CANTIDAD);
                let iDif = iNum2 - iNum1;
                let dFecha = new Date().toJSON().substring(0,10);
                let aFecha = dFecha.split("-");
                let sFecha = aFecha[2]+"-"+aFecha[1]+"-"+aFecha[0];
  
                let oHora = new Date().toLocaleTimeString();
                oRegla.CANTIDAD = iDif;
                oRegla.USUARIO = this.usuario;
                oRegla.HORACARGA = oHora;
  
                let oReglaCreada = await this.fnCrearRegla(oRegla);
                this.fnActualizarSolicitudBTP(oItem.IDDCTOBTP, "A", sFecha, oHora, oRegla.PRECIOMIN, iDif, oRegla.PORCENTAJEMIN, oReglaCreada.IDREGLA);
                this.fnActualizarSolicitudECC(oItem, "A");
                
              },
  
              fnActualizarSolicitudBTP: function(pSolicitud, pEstado, pFechaAprobSol, pHoraAprobSol, pPrecioRegla, pCantRegla, pProcentRegla, pUUIDReglaCreada){
  
                let that = this;
                                    
                let oModel  = this.getOwnerComponent().getModel("srvCatalogoWP");
  
                let sEntity = "/ZSD_TB_SOL_MAT_DCTO_BTP";
                var sPath = oModel.createKey(sEntity, {
                  IDDCTOBTP: pSolicitud
              });
  
                  
                    var mParameters = {};
                    
                    if(pEstado != null){mParameters.ESTATUS = pEstado};
                    if(pFechaAprobSol != null){mParameters.FECHAAPROBSOL = pFechaAprobSol};
                    if(pHoraAprobSol != null){mParameters.HORAAPROBSOL = pHoraAprobSol};
                    if(pPrecioRegla != null){mParameters.PRECIOREGLA = pPrecioRegla};
                    if(pCantRegla != null){mParameters.CANTREGLA = pCantRegla};
                    if(pProcentRegla != null){mParameters.PROCENTREGLA = pProcentRegla};
                    if(pUUIDReglaCreada != null){mParameters.FK_ZSD_TB_REGLAS_IDREGLA = pUUIDReglaCreada};
  
                    oModel.update(sPath, mParameters, {
                        success: function(oReq, oRes){
                            
                            //actualizar en ECC
                           // that.fnActualizarSolicitudECC();
                            if(pEstado == "R"){
                              sap.m.MessageBox.information("Solicitud Rechazada correctamente.");
                            }else if(pEstado == "A"){
                              sap.m.MessageBox.information("Solicitud Aprobada correctamente.");
                            }
  
                           
                        },
                        error: function(oError){
                            if(oError.responseText){
                                let obj = JSON.parse(oError.responseText);
                                MessageBox.error(obj.error.message.value);
                            }
                        }
                    });
  
              },
  
              fnActualizarSolicitudECC: function(pRegistro, pEstado){
  
        
  
                let oModel = this.getOwnerComponent().getModel("srvCatalogoECC");
                let that = this;
              
                let oNewReg = {};
                oNewReg.Material  = pRegistro.CODMATERIAL;
                oNewReg.NroPedidoVM  = pRegistro.PEDIDO;
                oNewReg.Posicion         = pRegistro.POSPEDIDO;
                oNewReg.Status          = pEstado;
                oNewReg.Resultado          = "";
  
                
                
                try {
  
                    oModel.create("/SolicitudSet", oNewReg, {
                      groupId : pRegistro.PEDIDO,
                      success: function (oData, oResponse) {
                        let oDatos = oResponse.data;
                        resolve(oDatos);
                      },
                      error: function (oError) {
                        resolve("");
                        console.log('SE PRODUJO UN ERROR: ' + oError)
                      },
                    });
                  }
                  catch (err) {
                    let oDatos = oRes.data;
                    resolve("");
                  }
  
              
            
  
              },
  
              fnCrearRegla: async function(pRegistro){
  
                const oPromise = await new Promise((resolve, reject) => {
  
                  console.log(pRegistro);
    
            
                  let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                  let that = this;
                
                  let oNewReg = {};
                  oNewReg.FK_ZSD_TB_SECUENC_IDSECUENCIA  = pRegistro.FK_ZSD_TB_SECUENC_IDSECUENCIA;
                  oNewReg.DESCRSEC           = pRegistro.DESCRSEC;
                  oNewReg.FECHACARGA         = pRegistro.FECHACARGA;
                  oNewReg.HORACARGA          = pRegistro.HORACARGA;
                  oNewReg.CODMOTIVO          = pRegistro.CODMOTIVO;
                  oNewReg.DESCMOTIVO         = pRegistro.MOTIVO;
                  oNewReg.CODLOCAL           = pRegistro.CODLOCAL;
                  oNewReg.DESCLOCAL          = pRegistro.LOCAL;
                  oNewReg.CODMATERIAL        = pRegistro.CODMATERIAL;
                  oNewReg.DESCMATERIAL       = pRegistro.MATERIAL;
                  oNewReg.CODCLIENTE         = pRegistro.CODCLIENTE;
                  oNewReg.DESCCLIENTE        = pRegistro.CLIENTE;
                  oNewReg.CODSUCURSALLOC     = pRegistro.CODSUCURSAL;
                  oNewReg.DESCSUCURSALLOC    = pRegistro.SUCURSAL;
                  oNewReg.CODTIPOCLIENTE     = pRegistro.CODTIPOCLIENTE;
                  oNewReg.DESCTIPOCLIENTE    = pRegistro.TIPOCLIENTE;
                  oNewReg.CODSBTPCLIENTE     = pRegistro.CODSBTPCLIENTE;
                  oNewReg.DESCSBTPCLIENTE    = pRegistro.SUBTIPOCLIENTE
                  oNewReg.CODGRCONDCLIENTE   = pRegistro.CODGRCONDCLIENTE
                  oNewReg.DESCGRCONDCLIENTE  = pRegistro.GRCONDCLIENTE;
                  oNewReg.USUARIO            = this.usuario;
                  oNewReg.PRECIOMIN          = pRegistro.PRECIOMIN;
                  oNewReg.PORCENTAJEMIN      = pRegistro.PORCENTAJEMIN;
                  oNewReg.CANTIDAD           = pRegistro.CANTIDAD;
                  oNewReg.TOLERANCIAPRECIO   = pRegistro.TOLERANCIAPRECIO;
                  oNewReg.TOLERANCIAPROCENT  = pRegistro.TOLERANCIAPROCENT;
                  oNewReg.MONEDA             = pRegistro.MONEDA;
                  oNewReg.UMPRECIO           = pRegistro.UMPRECIO;
                  oNewReg.UMCANTIDAD         = pRegistro.UMCANTIDAD;
                  oNewReg.PROCMANUAL         = pRegistro.PROCMANUAL;
                  oNewReg.APLICAPORCENT      = pRegistro.APLICAPORCENT;
                  oNewReg.LIMFEENTREGA       = pRegistro.LIMFEENTREGA;
                  oNewReg.DESCRSECDATOS       = pRegistro.DESCRSECDATOS;
                  
                  try {
    
                      oModel.create("/ZSD_TB_REGLAS", oNewReg, {
                        groupId : pRegistro.FK_ZSD_TB_SECUENC_IDSECUENCIA,
                        success: function (oData, oResponse) {
                          let oDatos = oResponse.data;
                          resolve(oDatos);
                        },
                        error: function (oError) {
                          resolve("");
                          console.log('SE PRODUJO UN ERROR: ' + oError)
                        },
                      });
                    }
                    catch (err) {
                      let oDatos = oRes.data;
                      resolve("");
                    }
  
                  });
              
  
  
                  return oPromise;
            },
  
  
              fnValidarEstadoSolicitud: async function(pSolicitud){
  
                const oPromise = await new Promise((resolve, reject) => {
  
                  let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                  let sEntity = "/ZSD_TB_SOL_MAT_DCTO_BTP";
                  var sPath = oModel.createKey(sEntity, {
                    IDDCTOBTP: pSolicitud.IDDCTOBTP,
                    IsActiveEntity: true
                });
  
                oModel.read(sPath,{
                  success: function(oReq, oRes){
                      let oDatos = oRes.data;
                      resolve(oDatos.ESTATUS);
                      sap.ui.core.BusyIndicator.hide();
  
                  },
                  error: function(oError){
                    sap.ui.core.BusyIndicator.hide();
                    resolve("");
                  }
                });
  
  
              });
              
  
  
                return oPromise;
  
  
     
  
              },

              fnRechazarMasivo: async function(oEvent){

          
                    
                    let oItem = this.getView().getModel("modeloSolicitud").getData();
                    //validar si alguno registro del bloque tiene problemas
                      let sResultado = await this.fnValidarEstadoSolicitud(oItem);
                      if(sResultado != "P"){
                        sap.m.MessageBox.error("Solicitud "+  oItem.PEDIDO + "-"+ oItem.POSPEDIDO +" ya fue evaluada");
                      }else{
                        sap.m.MessageBox.confirm("¿Está seguro que desea rechazar esta solicitud: "+ oItem.PEDIDO + "-"+ oItem.POSPEDIDO  , {
                          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                          emphasizedAction: sap.m.MessageBox.Action.YES,
                          onClose: function (sAction) {
                              if (sAction == "YES"){
  
                                if(oItem.FK_ZSD_TB_REGLAS_IDREGLA != null && oItem.FK_ZSD_TB_REGLAS_IDREGLA != "" ){
  
            
                                  let oModel = this.getView().getModel("modeloReglaActual").getData().results;
                                  let oReglaS =  oModel.filter(obj=>obj.IDREGLA == oItem.IDREGLA);
                    
                                  let sCantidad = null;
                                  let sPrecio = null;
                                  let sPorc = null;
                                  
                                  if(oReglaS.length > 0){
                                    let oRegla = oReglaS[0];

                                    sCantidad = oRegla.CANTIDAD;
                                    sPrecio = oRegla.PRECIOMIN;
                                    sPorc= oRegla.PORCENTAJEMIN;

                                  }
                                  //obtenemos el primer registro
                                 
  
                                  let dFecha = new Date().toJSON().substring(0,10);
                                  let aFecha = dFecha.split("-");
                                  let sFecha = aFecha[2]+"-"+aFecha[1]+"-"+aFecha[0];
                    
                                  let oHora = new Date().toLocaleTimeString();
                            

                
                                  this.fnActualizarSolicitudBTP(oItem.IDDCTOBTP, "R", sFecha, oHora, sPrecio, sCantidad, sPorc, null);
                                  this.fnActualizarSolicitudECC(oItem, "R");
  
  
  
                                }else{
                                  //se debe solo actualizar el registro no mas en la tabla BTP
                                  let dFecha = new Date().toJSON().substring(0,10);
                                  let aFecha = dFecha.split("-");
                                  let sFecha = aFecha[2]+"-"+aFecha[1]+"-"+aFecha[0];
  
                                  let oHora = new Date().toLocaleTimeString();
  
                                  this.fnActualizarSolicitudBTP(oItem.IDDCTOBTP, "R", sFecha, oHora, null, null, null, null);
                                  this.fnActualizarSolicitudECC(oItem, "R");
                                }
                                  
  
                              }
                              
                          }.bind(this)
                      });
                      }
                
  
              }
            
        });
    });

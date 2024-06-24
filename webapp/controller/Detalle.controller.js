sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "../model/formatter"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, formatter) {
        "use strict";

        return Controller.extend("wfprecios.zsdaprobmanualsol.controller.Detalle", {
          usuario: "",
          usuarioBTP:  "",
          formatter: formatter,

            onInit: function () {

                this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRouteMatched, this);

            },

            fnObtenerUsuario: async function(){

              const oPromise = await new Promise((resolve, reject) => {


                
                this.usuario = "svidal@seidor.com";
  
                let sEmail = "";
                if (sap.ushell.Container !== undefined) {
                    sEmail = sap.ushell.Container.getUser().getEmail();
                  if(sEmail == undefined){
                    sEmail =  this.usuario;
                  }
                }else{
                  sEmail =  this.usuario;
                }

                  if(sEmail){

                    this.usuario = sEmail;

                    let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                    let that = this;
                    let sEntity = "/ZSD_TB_USUARIOS";
                    let aFiltros = [];
                    let oFilter3 = new sap.ui.model.Filter("USUARIOBTP", sap.ui.model.FilterOperator.EQ, this.usuario);
                    aFiltros.push(oFilter3);
    
                    let oFiltroFinal = new sap.ui.model.Filter({ filters: aFiltros, and: false });
                    
    
                    try {
      
                     oModel.read(sEntity,{
                          filters: [oFiltroFinal],
                          success: function (oData, oResponse) {
                            let oDatos = oResponse.data;
                            if(oDatos.results.length > 0){
                              resolve(oDatos.results[0]);
                            }
                            else{
                              resolve("");
                            }
                           
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
                   }else{
                    resolve("");
                   }
      
                }


               

                );
            


                return oPromise;
               },




              fnCargarInformacionFiltros: async function(sIdDctoBtp){

                let oDatos = await this.fnObtenerUsuario();
                this.usuarioBTP = oDatos.USUARIOSAP;
  
     
  
  
                if(!this.usuarioBTP){
                  sap.m.MessageBox.information("Usted no está registrado como usuario aprobador en BTP, solicite su asignación");
                }
                else{
           
                  let bRes = await this.fnObtenerReglaActualPromesa();
       
                    //obtener solicitudes
                    this.fnObtenerDetalleSolicitud(sIdDctoBtp);
                      
                }
  
              },

              fnObtenerReglaActualPromesa: async function(){

                const oPromise = await new Promise((resolve, reject) => {
  
  
  
  
                //  let sFechaHoy = formatter.fechaLocalHoy();

                  let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                  let that = this;
                  let sEntity = "/ZVINFOMAXREGLA";

                  let aFiltros = [];
                //  let oFilter3 = new sap.ui.model.Filter("FECHACARGA", sap.ui.model.FilterOperator.EQ, sFechaHoy);
                  //aFiltros.push(oFilter3);
                  //let oFiltroFinal = new sap.ui.model.Filter({ filters: aFiltros, and: false });
                  
  
                  try {
    
     
                   oModel.read(sEntity,{
                            success: function (oData, oResponse) {
                              let oDatos = oResponse.data;
                              let oJsonModel = new sap.ui.model.json.JSONModel(oDatos);
                              that.getView().setModel(oJsonModel, "modeloReglaActual");
                              that.getView().getModel("modeloReglaActual").refresh();
        
                              resolve(true);
                            },
                            error: function (oError) {
                              resolve(true);
                              console.log('SE PRODUJO UN ERROR: ' + oError)
                            },
                          });
                        }
                        catch (err) {
                          resolve(false);
                        }
  
                  });
              
  
                  return oPromise;
                 },
  

            _onRouteMatched: function (oEvent) {
                let oArgs = oEvent.getParameter("arguments");
    
                if(oArgs.id_solicitud != undefined){
                    let sIdDctoBtp = oArgs.id_solicitud.replaceAll("'", "");
          
                    this.fnCargarInformacionFiltros(sIdDctoBtp);
                    
                 //   this.fnCargarValidaciones(sIdDTE);
                }
            },

            fnObtenerDatoUsuario: function(){

              let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
              let sEntity = "/ZSD_TB_USUARIOS";
              let that = this;

              let aFiltros = [];
              let oFilter = new sap.ui.model.Filter("USUARIOBTP", sap.ui.model.FilterOperator.EQ, this.usuario);
              aFiltros.push(oFilter);

              let oFiltroFinal = new sap.ui.model.Filter({ filters: aFiltros, and: false });


              oModel.read(sEntity,{
                  filters: oFiltroFinal,
                  success: function(oReq, oRes){
                      let oDatos = oRes.data;
                      let oJsonModel = new sap.ui.model.json.JSONModel(oDatos);
                      that.getView().setModel(oJsonModel, "modeloDatosUsuario");
                      that.getView().getModel("modeloDatosUsuario").refresh();

                      //obtener solicitudes
                      that.fnBuscarSolicitudesFiltros();

                  },
                  error: function(oError){
                      console.log(oError);
                  }
              });

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

                            
                                  //obtener datos de la regla actual segun la secuencia
                                    this.fnProcesarRegistro(oItem);

                                }else{
                                  //se debe solo actualizar el registro no mas en la tabla BTP

                                  let sFecha = formatter.fechaLocalHoyBD();

                                  let oHora = new Date().toLocaleTimeString();

                                  this.fnActualizarSolicitudBTP(oItem, "A", sFecha, oHora, null, null, null, null);
                                  this.fnActualizarSolicitudECC(oItem, "A");
                                }
          
                              }
                              
                          }.bind(this)
                      });
                      }
                
  
              },
  
              fnProcesarRegistro: async function(oItem){
  
              let oModel = this.getView().getModel("modeloReglaActual").getData();

              if(oModel.IDREGLA == oItem.IDREGLA){
                //obtenemos el primer registro
                let oRegla = oModel;
                let iNum1 = parseInt(oItem.CANTIDAD);
                let iNum2 = parseInt(oRegla.CANTIDAD);
                let iDif = iNum2 - iNum1;

                let sFecha = formatter.fechaLocalHoyBD();

                let oHora = new Date().toLocaleTimeString();
                oRegla.CANTIDAD = iDif;
                oRegla.USUARIO = this.usuario;
                oRegla.HORACARGA = oHora;

                let oReglaCreada = await this.fnCrearRegla(oRegla);
                this.fnActualizarSolicitudBTP(oItem, "A", sFecha, oHora, oRegla.PRECIOMIN, iNum2, oRegla.PORCENTAJEMIN, oRegla.IDREGLA);
                this.fnActualizarSolicitudECC(oItem, "A");
              }
     

                
                
              },
  
              fnActualizarSolicitudBTP: function(pSolicitud, pEstado, pFechaAprobSol, pHoraAprobSol, pPrecioRegla, pCantRegla, pProcentRegla, pUUIDReglaCreada){
  
                let that = this;
                                  
                let oModel  = this.getOwnerComponent().getModel("srvCatalogoWP");
  
                let sEntity = "/ZSD_TB_SOL_MAT_DCTO_BTP";
                var sPath = oModel.createKey(sEntity, {
                  IDDCTOBTP: pSolicitud.IDDCTOBTP
              });
  
                  
                    var mParameters = {};
                    
                    if(pEstado != null){mParameters.ESTATUS = pEstado};
                    if(pFechaAprobSol != null){mParameters.FECHAAPROBSOL = pFechaAprobSol};
                    if(pHoraAprobSol != null){mParameters.HORAAPROBSOL = pHoraAprobSol};
                    if(pPrecioRegla != null){
                      
                      mParameters.PRECIOREGLA = pPrecioRegla.toString();
                      mParameters.PRECIOREGLA     = formatter.parseDecimal(mParameters.PRECIOREGLA); 
                    
                    }
                    if(pCantRegla != null){
                      
                      mParameters.CANTREGLA = pCantRegla.toString();
                      mParameters.CANTREGLA     = formatter.parseDecimal(mParameters.CANTREGLA); 
                    }
  
                    if(pProcentRegla != null){
                      
                      mParameters.PROCENTREGLA = pProcentRegla.toString();
                      mParameters.PROCENTREGLA     = formatter.parseDecimal(mParameters.PROCENTREGLA); 
                    }
                    if(pUUIDReglaCreada != null){mParameters.FK_ZSD_TB_REGLAS_IDREGLA = pUUIDReglaCreada};
  
                    oModel.update(sPath, mParameters, {
                        success: function(oReq, oRes){
                            
                            //actualizar en ECC
                           // that.fnActualizarSolicitudECC();
                            if(pEstado == "R"){
                              sap.m.MessageBox.information("Solicitud Rechazada correctamente.");
                            }else if(pEstado == "A"){
  
                              if(pSolicitud.CODMOTDERRECH == "006"){
                                sap.m.MessageBox.information("Se aprueba solicitud con UMP Errónea, se debe corregir regla");
                              }
                              else{
                                sap.m.MessageBox.information("Solicitud Aprobada correctamente.");
                              }                              
  
                             
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
                  oNewReg.FECHACARGA         = formatter.dateToBD(pRegistro.FECHACARGA);
                  oNewReg.HORACARGA          = pRegistro.HORACARGA;
                  oNewReg.CODMOTIVO          = pRegistro.CODMOTIVO;
                  oNewReg.DESCMOTIVO         = pRegistro.DESCMOTIVO;
                  oNewReg.CODLOCAL           = pRegistro.CODLOCAL;
                  oNewReg.DESCLOCAL          = pRegistro.DESCLOCAL;
                  oNewReg.CODMATERIAL        = pRegistro.CODMATERIAL;
                  oNewReg.DESCMATERIAL       = pRegistro.DESCMATERIAL;
                  oNewReg.CODCLIENTE         = pRegistro.CODCLIENTE;
                  oNewReg.DESCCLIENTE        = pRegistro.DESCCLIENTE;
                  oNewReg.CODSUCURSALLOC     = pRegistro.CODSUCURSAL;
                  oNewReg.DESCSUCURSALLOC    = pRegistro.DESCSUCURSALLOC;
                  oNewReg.CODTIPOCLIENTE     = pRegistro.CODTIPOCLIENTE;
                  oNewReg.DESCTIPOCLIENTE    = pRegistro.DESCTIPOCLIENTE;
                  oNewReg.CODSBTPCLIENTE     = pRegistro.CODSBTPCLIENTE;
                  oNewReg.DESCSBTPCLIENTE    = pRegistro.DESCSBTPCLIENTE
                  oNewReg.CODGRCONDCLIENTE   = pRegistro.CODGRCONDCLIENTE
                  oNewReg.DESCGRCONDCLIENTE  = pRegistro.DESCGRCONDCLIENTE;
                  oNewReg.USUARIO            = pRegistro.USUARIO;
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

          
                                  let oModel = this.getView().getModel("modeloReglaActual").getData();

                                  if(oModel.IDREGLA == oItem.IDREGLA){
                                    //obtenemos el primer registro
                                    let oRegla = oModel;

                    
                    
           
                                  let sFecha = formatter.fechaLocalHoyBD();
                    
                                  let oHora = new Date().toLocaleTimeString();
                                 // oRegla.CANTIDAD = oRegla.CANTIDAD;
                                 // oRegla.USUARIO = this.usuario;
                                 // oRegla.HORACARGA = oHora;
                    
                                 
  
  
                                  this.fnActualizarSolicitudBTP(oItem, "R", sFecha, oHora, oRegla.PRECIOMIN, oRegla.CANTIDAD, oRegla.PORCENTAJEMIN, oRegla.IDREGLA);
                                  this.fnActualizarSolicitudECC(oItem, "R");
                                  }
  
  
                                }else{
  
                                  /*
                                  let oRegla = {
                                    PRECIOREGLA:null,
                                    PROCENTREGLA:null,
                                    CANTREGLA:null,
                                    UMPRECIO:null,
                                    IDREGLA:null,
                                  };

                                  let oModel = this.getView().getModel("modeloReglaActual").getData();

                                  if(oModel.FK_ZSD_TB_SECUENC_IDSECUENCIA == oItem.FK_ZSD_TB_SECUENC_IDSECUENCIA){

                                    let sDescSec = oModel.DESCRSEC;
                                    let aCampos = sDescSec.split("/");
                                    let sDescSecDatos = "";
                                    aCampos.forEach(element => {
                                        sDescSecDatos = sDescSecDatos + elemento[element] + "/";
                                    });
        
                                    sDescSecDatos = sDescSecDatos.substring(0,sDescSecDatos.length -1 );
        
                                    let oModel2 = this.getView().getModel("modeloReglaActual").getData();
  
                                    if(oModel2.DESCRSECDATOS == sDescSecDatos){
                                      oRegla.PRECIOREGLA = oModel2.PRECIOMIN;
                                      oRegla.PROCENTREGLA = oModel2.PORCENTAJEMIN;
                                      oRegla.CANTREGLA = oModel2.CANTIDAD;
                                      oRegla.UMPRECIO  = oModel2.UMPRECIO;
                                      oRegla.IDREGLA = oModel2.IDREGLA;

                                    }
        
                                   
                                  }

                               
  

  
  
                                  //se debe solo actualizar el registro no mas en la tabla BTP
      
                                  let sFecha = formatter.fechaLocalHoy();
  
                                  let oHora = new Date().toLocaleTimeString();
  
                                  this.fnActualizarSolicitudBTP(oItem, "R", sFecha, oHora, oRegla.PRECIOREGLA, oRegla.CANTREGLA, oRegla.PROCENTREGLA, oRegla.IDREGLA);
                                  this.fnActualizarSolicitudECC(oItem, "R");
                                  */

                                  let oModel = this.getView().getModel("modeloReglaActual").getData().results;

                                let aEsta = oModel.filter(obj=>obj.FK_ZSD_TB_SECUENC_IDSECUENCIA == oItem.FK_ZSD_TB_SECUENC_IDSECUENCIA);
                                let oRegla = {
                                  PRECIOREGLA:null,
                                  PROCENTREGLA:null,
                                  CANTREGLA:null,
                                  UMPRECIO:null,
                                  IDREGLA:null,
                                };

                                
                                if(aEsta.length > 0){
      
                                  let sDescSec = aEsta[0].DESCRSEC;
                                  let aCampos = sDescSec.split("/");
                                  let sDescSecDatos = "";
                                  aCampos.forEach(element => {
                                      sDescSecDatos = sDescSecDatos + elemento[element] + "/";
                                  });
      
                                  sDescSecDatos = sDescSecDatos.substring(0,sDescSecDatos.length -1 );
      
                                  let oModel = this.getView().getModel("modeloReglaActual").getData().results;

                                  let oReglaS =  oModel.filter(obj=>obj.DESCRSECDATOS == sDescSecDatos);
      
                                  if(oReglaS.length>0){
                                    oRegla.PRECIOREGLA = oReglaS[0].PRECIOMIN;
                                    oRegla.PROCENTREGLA = oReglaS[0].PORCENTAJEMIN;
                                    oRegla.CANTREGLA = oReglaS[0].CANTIDAD;
                                    oRegla.UMPRECIO  = oReglaS[0].UMPRECIO;
                                    oRegla.IDREGLA = oReglaS[0].IDREGLA;
                                  }

                                }


                                //se debe solo actualizar el registro no mas en la tabla BTP

                                let sFecha = formatter.fechaLocalHoyBD();

                                let oHora = new Date().toLocaleTimeString();

                                this.fnActualizarSolicitudBTP(oItem, "R", sFecha, oHora, oRegla.PRECIOREGLA, oRegla.CANTREGLA, oRegla.PROCENTREGLA, oRegla.IDREGLA);
                                this.fnActualizarSolicitudECC(oItem, "R");
                                
                                }
                                  
  
                              }
                              
                          }.bind(this)
                      });
                      }
                
  
              }
            
        });
    });

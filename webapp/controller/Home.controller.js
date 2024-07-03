sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/p13n/Engine',
    'sap/m/p13n/SortController',
    'sap/m/p13n/GroupController',
    'sap/m/p13n/MetadataHelper',
    'sap/ui/model/Sorter',
    'sap/ui/core/library',
    'sap/m/table/ColumnWidthController',
    "sap/ui/export/Spreadsheet",
    "../model/formatter"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Engine, SortController, GroupController, MetadataHelper, Sorter, CoreLibrary, ColumnWidthController, Spreadsheet, formatter) {
        "use strict";

        return Controller.extend("wfprecios.zsdaprobmanualsol.controller.Home", {

            usuario: "",
            usuarioBTP:  "",
            formatter: formatter,
            aMensajesProceso: [],

            onInit:  function () {

          

                this._registerForP13n();

               let oDatos = {
                  cantidades: {
                    CantTotal: 0,
                    CantVendedor: 0,
                    CantPreventa: 0,
                    CantCallCenter: 0,
                    CantTradicional: 0,
                    CantFoodservice: 0,
                    CantIndustriales: 0,
                    CantGrandesClientes: 0,
                    CantSupermercados: 0,
                  },
                  moneda : "CLP"
                };

                var oJsonModelDatos = new sap.ui.model.json.JSONModel(oDatos);
                this.getView().setModel(oJsonModelDatos, "modelDatos");


                //Validar
                this.fnCargarInformacionFiltros();
            },

            fnCargarInformacionFiltros: async function(){

              let oDatos = await this.fnObtenerUsuario();
              this.usuarioBTP = oDatos.USUARIOSAP;

              
              if(!this.usuarioBTP){
                sap.m.MessageBox.information("Usted no está registrado como usuario aprobador en BTP, solicite su asignación");
              }
              else{
         
                let bRes = await this.fnObtenerReglaActualPromesa();
     
                  //obtener solicitudes
                  this.fnBuscarSolicitudesFiltros();
                
                    
              }

            },

            fnActualizarDesdeTabla: async function(){
        
              let oDatos = await this.fnObtenerUsuario();
              this.usuarioBTP = oDatos.USUARIOSAP;


              if(!this.usuarioBTP){
                sap.m.MessageBox.information("Usted no está registrado como usuario aprobador en BTP, solicite su asignación");
              }
              else{
         
                let bRes = await this.fnObtenerReglaActualPromesa();
     
                  //obtener solicitudes
                  this.fnBuscarSolicitudesFiltros();
                
                    
              }


            },

            fnObtenerReglaActual: async function(){


              let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
              let sEntity = "/ZVINFOMAXREGLA";
              let that = this;


              oModel.read(sEntity,{
                  success: function(oReq, oRes){
                      let oDatos = oRes.data;
                      let oJsonModel = new sap.ui.model.json.JSONModel(oDatos);
                      that.getView().setModel(oJsonModel, "modeloReglaActual");
                      that.getView().getModel("modeloReglaActual").refresh();

                      that.fnBuscarSolicitudes();

                               },
                  error: function(oError){
                      console.log(oError);
                  }
              });

            },

            fnObtenerReglaActualPromesa: async function(){

              const oPromise = await new Promise((resolve, reject) => {


                    //let sFechaHoy = formatter.fechaLocalHoy();
                    let sFechaHoy = new Date();

                    let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                    let that = this;
                    let sEntity = "/ZVINFOMAXREGLA";

                   /* let aFiltros = [];
                    let oFilter3 = new sap.ui.model.Filter("FECHACARGA", sap.ui.model.FilterOperator.EQ, sFechaHoy);
                    aFiltros.push(oFilter3);
                    let oFiltroFinal = new sap.ui.model.Filter({ filters: aFiltros, and: false });
                    */
    
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

        
            onSelectTab: function(oEvent){
               this.fnFiltrarTabla(oEvent.getSource().getSelectedKey());
            },

            fnFiltrarTabla: function(pItem){

              let aFilter = [];
              
              switch (pItem) {

                case "vendedor":
                    aFilter.push(new sap.ui.model.Filter("tipo_sol", "EQ", pItem)); 
                    break;
                case "preventa":
                    aFilter.push(new sap.ui.model.Filter("tipo_sol", "EQ", pItem)); 
                    break;
                case "call_center":
                    aFilter.push(new sap.ui.model.Filter("tipo_sol", "EQ", pItem)); 
                    break;

                case "tradicional":
                    aFilter.push(new sap.ui.model.Filter("tipo_cli", "EQ", pItem));  
                    break;
                
                case "foodservice":
                    aFilter.push(new sap.ui.model.Filter("tipo_cli", "EQ", pItem));  
                    break;

                case "industriales":
                    aFilter.push(new sap.ui.model.Filter("tipo_cli", "EQ", pItem)); 
                    break; 
                
                case "grandes_clientes":
                    aFilter.push(new sap.ui.model.Filter("tipo_cli", "EQ", pItem)); 
                    break; 

                case "supermercados":
                    aFilter.push(new sap.ui.model.Filter("tipo_cli", "EQ", pItem)); 
                    break;   
                 
                default:
                  break;
              }
              let oList = this.getView().byId("tabla_ok");
              if(pItem == "todo"){
    
                // filter binding 
                
                let oBinding = oList.getBinding("rows").filter();

              }else{
                let filtro = new sap.ui.model.Filter({
                  filters: aFilter,
                  and: false
                });
        
                let oBinding = oList.getBinding("rows").filter(filtro);
              }
            
         


            },

/* INICIO EXPORTAR EXCEL DATOS */

            fnCreateColumnExport: function() {

              return [
                    {
                      property: "tipo_sol",
                      label: "Tipo Solicitud"
                    },
                    {
                      property: "DESCMOTIVO",
                      label: "Motivo"
                    },
                    {
                      property: "FECHADESPACHO",
                      label: "Fe. Entrega"
                    },
                    {
                      property: "CODLOCAL",
                      label: "Cod Local"
                    },
                    {
                      property: "CODMATERIAL",
                      label: "Cod. Material"
                    },
                    {
                      property: "DESCMATERIAL",
                      label: "Material"
                    },
                    {
                      property: "DESCTIPOCLIENTE",
                      label: "Tp. Cliente"
                    },
                    {
                      property: "DESCSUCURSALLOC",
                      label: "Sucursal"
                    },
                    {
                      property: "PORCENTAJEDSCTO",
                      label: "% Dscto."
                    },
                    {
                      property: "PRECIOWFCONDSCTOUNI",
                      label: "Precio solicitado"
                    },
                    {
                      property: "UMV",
                      label: "Cantidad UM"
                    },
                    {
                      property: "CANTIDAD",
                      label: "Cantidad"
                    },
                    {
                      property: "PRECIOREGLA",
                      label: "Precio regla"
                    },
                    {
                      property: "UMPRECIO",
                      label: "UMP Regla"
                    },
                    {
                      property: "PROCENTREGLA",
                      label: "% Dscto. reglae"
                    },
                    {
                      property: "CANTREGLA",
                      label: "Cantidad regla"
                    },
                    
{ property: "CODEJECUTIVO", label: "Cod.Ejecutivo"},
{ property: "DESCEJECUTIVO", label: "Ejecutivo"},
{ property: "PEDIDO", label: "Pedido"},
{ property: "POSPEDIDO", label: "Pos.Pedido"},
{ property: "DESCLOCAL", label: "Local"},
{ property: "CODPREVENTA", label: "Cod.Preventa"},
{ property: "DESCPREVENTA", label: "Preventa"},
{ property: "CODVENDEDOR", label: "Cod.Vendedor"},
{ property: "DESCVENDEDOR", label: "Vendedor"},
{ property: "CODCLIENTE", label: "Cod.Cliente"},
{ property: "DESCCLIENTE", label: "Cliente"},
{ property: "CODCENTRO", label: "Cod.Centro"},
{ property: "CODSECTOR", label: "Cod.Sector"},
{ property: "DESCSECTOR", label: "Sector"},
{ property: "CODESTADO", label: "Cod.Estado"},
{ property: "DESCESTADO", label: "Estado"},
{ property: "CODCLASIFICACION", label: "Cod.Clasificación"},
{ property: "DESCCLASIFICACION", label: "Clasificación"},
{ property: "PRECIOLISTAUNI", label: "Precio de lista"},
{ property: "VALORRECARGOUNI", label: "Valor recargo"},
{ property: "UMP", label: "UMP"},
{ property: "CODMOTIVO", label: "Cod.Motivo"},
{ property: "ESTATUS", label: "Estatus"},
{ property: "CODUSERAPROB", label: "Cod.Aprobador"},
{ property: "DESCUSERAPROB", label: "Aprobador"},
{ property: "FECHARECEPSOL", label: "Fe.Recepción"},
{ property: "HORARECEPSOL", label: "Hora Recepción"},
{ property: "FECHAAPROBSOL", label: "Fe.Aprobación"},
{ property: "HORAAPROBSOL", label: "Hora Aprobación"},
{ property: "CODSUCURSALLOC", label: "Cod.Sucursal"},
{ property: "CODTIPOCLIENTE", label: "Cod.Tipo Cliente"},
{ property: "CODSBTPCLIENTE", label: "Cod.SbTp.Cliente"},
{ property: "DESCSBTPCLIENTE", label: "Subtipo Cliente"},
{ property: "CODGRCONDCLIENTE", label: "Cod.Gr.Cond.Cliente"},
{ property: "DESCGRCONDCLIENTE", label: "Gr.Cond.Cliente"},
{ property: "TIPOPROCES", label: "Tipo Procesamiento"},
{ property: "CODMOTDERRECH", label: "Cod.Motivo Rech/Dev"},
{ property: "MOTDERRECH", label: "Motivo Rech/Dev"},
{ property: "IDDCTOBTP", label: "ID Solicitud"},
{ property: "FK_ZSD_TB_SECUENC_IDSECUENCIA", label: "ID Secuencia"},
{ property: "FK_ZSD_TB_REGLAS_IDREGLA", label: "ID Regla"}
                    ];
            },

            fnExportar: function() {
              var aCols,  oSettings, oSheet;

              aCols = this.fnCreateColumnExport();

              if(this.getView().getModel("modeloSolicitudes").getData().results.length > 0){
                let aDatos = this.getView().getModel("modeloSolicitudes").getData().results;

                oSettings = {
                  workbook: { columns: aCols },
                  dataSource: aDatos,
                          fileName : "Solicitudes",
                  format : "xls"
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build()
                  .then(function() {
                    MessageBox.success("El excel se ha ejecutado correctamente");
                  }).finally(function() {
                    oSheet.destroy();
                  });
                }else{
                  sap.m.MessageBox.information("No hay datos para descargar");

                }

            },

/* FIN EXPORTAR DATOS EXCEL */

            /** INICIO funcionalidad de sleect campos de tabla */
            openPersoDialog: function(oEvt) {
                const oTable = this.getView().byId("tabla_ok");
  
                Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                  contentHeight: "35rem",
                  contentWidth: "32rem",
                  source: oEvt.getSource()
                });
              },
            _registerForP13n: function() {
              const oTable =  this.getView().byId("tabla_ok");

              this.oMetadataHelper = new MetadataHelper([

              
                {
                  key: "DETALLE",
                  label: "Detalle",
                  path: "DETALLE"
                },{
                  key: "DESCMOTIVO",
                  label: "Motivo",
                  path: "DESCMOTIVO"
                },
                {
                  key: "FECHADESPACHO",
                  label: "Fe. Entrega",
                  path: "FECHADESPACHO"
                },
                {
                  key: "CODLOCAL",
                  label: "Cod. Local",
                  path: "CODLOCAL"
                },
                {
                  key: "CODMATERIAL",
                  label: "Cod Material",
                  path: "CODMATERIAL"
                },
                
                {
                  key: "DESCMATERIAL",
                  label: "Material",
                  path: "DESCMATERIAL"
                },
                {
                  key: "DESCTIPOCLIENTE",
                  label: "Tipo Cliente",
                  path: "DESCTIPOCLIENTE"
                },
                {
                  key: "DESCSUCURSALLOC",
                  label: "Sucursal",
                  path: "DESCSUCURSALLOC"
                },
                
                {
                  key: "PORCENTAJEDSCTO",
                  label: "% Dscto.",
                  path: "PORCENTAJEDSCTO"
                },
                {
                  key: "PRECIOWFCONDSCTOUNI",
                  label: "Precio solicitado",
                  path: "PRECIOWFCONDSCTOUNI"
                }

                ,
                {
                  key: "CANTIDAD",
                  label: "Cantidad",
                  path: "CANTIDAD"
                },
                {
                  key: "UMV",
                  label: "UM Cantidad",
                  path: "UMV"
                }
                ,
                {
                  key: "PRECIOREGLA",
                  label: "Precio regla",
                  path: "PRECIOREGLA"
                },
                {
                  key: "UMPRECIO",
                  label: "UMP Regla",
                  path: "UMPRECIO"
                },
                {
                  key: "PROCENTREGLA",
                  label: "% Dscto. regla",
                  path: "PROCENTREGLA"
                },
                {
                  key: "CANTREGLA",
                  label: "Cantidad regla",
                  path: "CANTREGLA"
                },
{ key: "CODEJECUTIVO", label: "Cod.Ejecutivo", path: "CODEJECUTIVO"},
{ key: "DESCEJECUTIVO", label: "Ejecutivo", path: "DESCEJECUTIVO"},
{ key: "PEDIDO", label: "Pedido", path: "PEDIDO"},
{ key: "POSPEDIDO", label: "Pos.Pedido", path: "POSPEDIDO"},
{ key: "DESCLOCAL", label: "Local", path: "DESCLOCAL"},
{ key: "CODPREVENTA", label: "Cod.Preventa", path: "CODPREVENTA"},
{ key: "DESCPREVENTA", label: "Preventa", path: "DESCPREVENTA"},
{ key: "CODVENDEDOR", label: "Cod.Vendedor", path: "CODVENDEDOR"},
{ key: "DESCVENDEDOR", label: "Vendedor", path: "DESCVENDEDOR"},
{ key: "CODCLIENTE", label: "Cod.Cliente", path: "CODCLIENTE"},
{ key: "DESCCLIENTE", label: "Cliente", path: "DESCCLIENTE"},
{ key: "CODCENTRO", label: "Cod.Centro", path: "CODCENTRO"},
{ key: "CODSECTOR", label: "Cod.Sector", path: "CODSECTOR"},
{ key: "DESCSECTOR", label: "Sector", path: "DESCSECTOR"},
{ key: "CODESTADO", label: "Cod.Estado", path: "CODESTADO"},
{ key: "DESCESTADO", label: "Estado", path: "DESCESTADO"},
{ key: "CODCLASIFICACION", label: "Cod.Clasificación", path: "CODCLASIFICACION"},
{ key: "DESCCLASIFICACION", label: "Clasificación", path: "DESCCLASIFICACION"},
{ key: "PRECIOLISTAUNI", label: "Precio de lista", path: "PRECIOLISTAUNI"},
{ key: "VALORRECARGOUNI", label: "Valor recargo", path: "VALORRECARGOUNI"},
{ key: "UMP", label: "UMP", path: "UMP"},
{ key: "CODMOTIVO", label: "Cod.Motivo", path: "CODMOTIVO"},
{ key: "ESTATUS", label: "Estatus", path: "ESTATUS"},
{ key: "CODUSERAPROB", label: "Cod.Aprobador", path: "CODUSERAPROB"},
{ key: "DESCUSERAPROB", label: "Aprobador", path: "DESCUSERAPROB"},
{ key: "FECHARECEPSOL", label: "Fe.Recepción", path: "FECHARECEPSOL"},
{ key: "HORARECEPSOL", label: "Hora Recepción", path: "HORARECEPSOL"},
{ key: "FECHAAPROBSOL", label: "Fe.Aprobación", path: "FECHAAPROBSOL"},
{ key: "HORAAPROBSOL", label: "Hora Aprobación", path: "HORAAPROBSOL"},
{ key: "CODSUCURSALLOC", label: "Cod.Sucursal", path: "CODSUCURSALLOC"},
{ key: "CODTIPOCLIENTE", label: "Cod.Tipo Cliente", path: "CODTIPOCLIENTE"},
{ key: "CODSBTPCLIENTE", label: "Cod.SbTp.Cliente", path: "CODSBTPCLIENTE"},
{ key: "DESCSBTPCLIENTE", label: "Subtipo Cliente", path: "DESCSBTPCLIENTE"},
{ key: "CODGRCONDCLIENTE", label: "Cod.Gr.Cond.Cliente", path: "CODGRCONDCLIENTE"},
{ key: "DESCGRCONDCLIENTE", label: "Gr.Cond.Cliente", path: "DESCGRCONDCLIENTE"},
{ key: "TIPOPROCES", label: "Tipo Procesamiento", path: "TIPOPROCES"},
{ key: "CODMOTDERRECH", label: "Cod.Motivo Rech/Dev", path: "CODMOTDERRECH"},
{ key: "MOTDERRECH", label: "Motivo Rech/Dev", path: "MOTDERRECH"},
{ key: "IDDCTOBTP", label: "ID Solicitud", path: "IDDCTOBTP"},
{ key: "FK_ZSD_TB_SECUENC_IDSECUENCIA", label: "ID Secuencia", path: "FK_ZSD_TB_SECUENC_IDSECUENCIA"},
{ key: "FK_ZSD_TB_REGLAS_IDREGLA", label: "ID Regla", path: "FK_ZSD_TB_REGLAS_IDREGLA"}

                
              ]);

              this._mIntialWidth = {

                "DETALLE": "6rem",
                "DESCMOTIVO": "6rem",
                "FECHADESPACHO": "6rem",
                "CODLOCAL": "6rem",
                "CODMATERIAL": "6rem",
                "DESCMATERIAL": "6rem",
                "DESCTIPOCLIENTE": "6rem",
                "DESCSUCURSALLOC": "6rem",
                "PORCENTAJEDSCTO": "6rem",
                "PRECIOWFCONDSCTOUNI": "6rem",
                "CANTIDAD": "6rem",
                "UMV": "6rem",
                "PRECIOREGLA": "6rem",
                "UMPRECIO": "6rem",
                "PROCENTREGLA": "6rem",
                "CANTREGLA": "6rem",
                
                "CODEJECUTIVO" : "6rem",
                "DESCEJECUTIVO" : "6rem",
                "PEDIDO" : "6rem",
                "POSPEDIDO" : "6rem",
                "DESCLOCAL" : "6rem",
                "CODPREVENTA" : "6rem",
                "DESCPREVENTA" : "6rem",
                "CODVENDEDOR" : "6rem",
                "DESCVENDEDOR" : "6rem",
                "CODCLIENTE" : "6rem",
                "DESCCLIENTE" : "6rem",
                "CODCENTRO" : "6rem",
                "CODSECTOR" : "6rem",
                "DESCSECTOR" : "6rem",
                "CODESTADO" : "6rem",
                "DESCESTADO" : "6rem",
                "CODCLASIFICACION" : "6rem",
                "DESCCLASIFICACION" : "6rem",
                "PRECIOLISTAUNI" : "6rem",
                "VALORRECARGOUNI" : "6rem",
                "UMP" : "6rem",
                "CODMOTIVO" : "6rem",
                "ESTATUS" : "6rem",
                "CODUSERAPROB" : "6rem",
                "DESCUSERAPROB" : "6rem",
                "FECHARECEPSOL" : "6rem",
                "HORARECEPSOL" : "6rem",
                "FECHAAPROBSOL" : "6rem",
                "HORAAPROBSOL" : "6rem",
                "CODSUCURSALLOC" : "6rem",
                "CODTIPOCLIENTE" : "6rem",
                "CODSBTPCLIENTE" : "6rem",
                "DESCSBTPCLIENTE" : "6rem",
                "CODGRCONDCLIENTE" : "6rem",
                "DESCGRCONDCLIENTE" : "6rem",
                "TIPOPROCES" : "6rem",
                "CODMOTDERRECH" : "6rem",
                "MOTDERRECH" : "6rem",
                "IDDCTOBTP" : "6rem",
                "FK_ZSD_TB_SECUENC_IDSECUENCIA" : "6rem",
                "FK_ZSD_TB_REGLAS_IDREGLA" : "6rem",



              };

              /* */

              Engine.getInstance().register(oTable, {
                helper: this.oMetadataHelper,
                controller: {
                  Columns: new sap.m.p13n.SelectionController({
                    targetAggregation: "columns",
                    control: oTable
                  }),
                  Sorter: new SortController({
                    control: oTable
                  }),
                  Groups: new GroupController({
                    control: oTable
                  }),
                  ColumnWidth: new ColumnWidthController({
                    control: oTable
                  })
                }
              });

              Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
            },

            handleStateChange: function(oEvt) {
              const oTable = this.getView().byId("tabla_ok");
              const oState = oEvt.getParameter("state");

              if (!oState) {
                return;
              }

              oTable.getColumns().forEach(function(oColumn) {

                const sKey = this._getKey(oColumn);
                const sColumnWidth = oState.ColumnWidth[sKey];

                oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey]);

                oColumn.setVisible(false);
                oColumn.setSortOrder(CoreLibrary.SortOrder.None);
              }.bind(this));

              oState.Columns.forEach(function(oProp, iIndex) {
                const oCol = this.byId(oProp.key);
              //  console.log(oCol);
                oCol.setVisible(true);

                oTable.removeColumn(oCol);
                oTable.insertColumn(oCol, iIndex);
              }.bind(this));

              const aSorter = [];
              oState.Sorter.forEach(function(oSorter) {
                const oColumn = this.byId(oSorter.key);
                /** @deprecated As of version 1.120 */
                oColumn.setSorted(true);
                oColumn.setSortOrder(oSorter.descending ? CoreLibrary.SortOrder.Descending : CoreLibrary.SortOrder.Ascending);
                aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
              }.bind(this));
              oTable.getBinding("rows").sort(aSorter);
            },


            onColumnHeaderItemPress: function(oEvt) {
              const oTable = this.getView().byId("tabla_ok");
              const sPanel = oEvt.getSource().getIcon().indexOf("sort") >= 0 ? "Sorter" : "Columns";

              Engine.getInstance().show(oTable, [sPanel], {
                contentHeight: "35rem",
                contentWidth: "100rem",
                source: oTable
              });
            },

            onSort: function(oEvt) {
              const oTable = this.getView().byId("tabla_ok");
              const sAffectedProperty = this._getKey(oEvt.getParameter("column"));
              const sSortOrder = oEvt.getParameter("sortOrder");

              //Apply the state programatically on sorting through the column menu
              //1) Retrieve the current personalization state
              Engine.getInstance().retrieveState(oTable).then(function(oState) {

                //2) Modify the existing personalization state --> clear all sorters before
                oState.Sorter.forEach(function(oSorter) {
                  oSorter.sorted = false;
                });
                oState.Sorter.push({
                  key: sAffectedProperty,
                  descending: sSortOrder === CoreLibrary.SortOrder.Descending
                });

                //3) Apply the modified personalization state to persist it in the VariantManagement
                Engine.getInstance().applyState(oTable, oState);
              });
            },

            onColumnMove: function(oEvt) {
              const oTable = this.getView().byId("tabla_ok");
              const oAffectedColumn = oEvt.getParameter("column");
              const iNewPos = oEvt.getParameter("newPos");
              const sKey = this._getKey(oAffectedColumn);
              oEvt.preventDefault();

              Engine.getInstance().retrieveState(oTable).then(function(oState) {

                const oCol = oState.Columns.find(function(oColumn) {
                  return oColumn.key === sKey;
                }) || {
                  key: sKey
                };
                oCol.position = iNewPos;

                Engine.getInstance().applyState(oTable, {
                  Columns: [oCol]
                });
              });
            },

            _getKey: function(oControl) {
              return this.getView().getLocalId(oControl.getId());
            },


            onColumnResize: function(oEvt) {
              const oColumn = oEvt.getParameter("column");
              const sWidth = oEvt.getParameter("width");
              const oTable = this.getView().byId("tabla_ok");

              const oColumnState = {};
              oColumnState[this._getKey(oColumn)] = sWidth;

              Engine.getInstance().applyState(oTable, {
                ColumnWidth: oColumnState
              });
            },
  /** FIN funcionalidad de sleect campos de tabla */
              




            fnRechazarMasivo: async function(oEvent){

              
              sap.ui.core.BusyIndicator.show(0);

              this.aMensajesProceso = [];
              let bProcesar = false;

              let aItemsTable = this.getView().byId("tabla_ok").getSelectedIndices();
              if(aItemsTable.length == 0){
                sap.m.MessageBox.information("Debe seleccionar un registro");
                sap.ui.core.BusyIndicator.hide();

                return;
              }

              for(let i in aItemsTable)
              {
                
                  let oItemSet =  this.getView().byId("tabla_ok").getContextByIndex(aItemsTable[i]);
                  bProcesar = true;
                  let oItem = oItemSet.getObject();
                  //validar si alguno registro del bloque tiene problemas
                    let sResultado = await this.fnValidarEstadoSolicitud(oItem);
                    if(sResultado != "P"){
                      //sap.m.MessageBox.error("Solicitud "+  oItem.PEDIDO + "-"+ oItem.POSPEDIDO +" ya fue evaluada");
                      this.aMensajesProceso.push("Solicitud "+  oItem.PEDIDO + "-"+ oItem.POSPEDIDO +" ya fue evaluada");

                    }else{
                

                              if(oItem.FK_ZSD_TB_REGLAS_IDREGLA != null && oItem.FK_ZSD_TB_REGLAS_IDREGLA != "" ){

          
                                let oModel = this.getView().getModel("modeloReglaActual").getData().results;
                                let oReglaS =  oModel.filter(obj=>obj.IDREGLA == oItem.IDREGLA);
                  
                                //obtenemos el primer registro
                                let oRegla = oReglaS[0];

                                let sFecha = formatter.fechaLocalHoyBD();
                  
                                let oHora = new Date().toLocaleTimeString();
                               // oRegla.CANTIDAD = oRegla.CANTIDAD;
                               // oRegla.USUARIO = this.usuario;
                               // oRegla.HORACARGA = oHora;
                  
                              
                               await  this.fnActualizarSolicitudBTP(oItem, "R", sFecha, oHora, oRegla.PRECIOMIN, oRegla.CANTIDAD, oRegla.PORCENTAJEMIN, oRegla.IDREGLA);
                               await this.fnActualizarSolicitudECC(oItem, "R");



                              }else{

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

                                await this.fnActualizarSolicitudBTP(oItem, "R", sFecha, oHora, oRegla.PRECIOREGLA, oRegla.CANTREGLA, oRegla.PROCENTREGLA, oRegla.IDREGLA);
                                await this.fnActualizarSolicitudECC(oItem, "R");
                              }
   
                   
                
                    }
              }

              sap.ui.core.BusyIndicator.hide();
              if(bProcesar){
               // let oModelWP  = this.getOwnerComponent().getModel("srvCatalogoWP");
               // let oModelECC = this.getOwnerComponent().getModel("srvCatalogoECC");
                //mostrar mensajes:
                let sMensaje = "";
                let iApro = 0, iRech = 0;
                for(var ele in this.aMensajesProceso){
                  let obj = this.aMensajesProceso[ele];
                  if(obj.includes("Solicitud rechazada")){
                    iRech++;
                  }else if(obj.includes("Solicitud aprobada")){
                    iApro++;
                  }else 
                  {
                    sMensaje = sMensaje + obj + "\n";
                  }
                }
                if(iApro == 1){
                  sMensaje = sMensaje + "Se aprobó solicitud" + "\n";
                }else if(iApro > 1){
                  sMensaje = sMensaje + "Se aprobaron "+iApro+" solicitudes" + "\n";
                }

                if(iRech == 1){
                  sMensaje = sMensaje + "Se rechazó solicitud" + "\n";
                }else if(iRech > 1){
                  sMensaje = sMensaje + "Se rechazaron "+iRech+" solicitudes" + "\n";
                }
                sap.m.MessageBox.information(sMensaje);
                this.aMensajesProceso = [];
              }

            },


            fnAprobarMasivo: async function(oEvent){

              sap.ui.core.BusyIndicator.show(0);

              this.aMensajesProceso = [];
              let bProcesar = false;

              let aItemsTable = this.getView().byId("tabla_ok").getSelectedIndices();
              if(aItemsTable.length == 0){
                sap.m.MessageBox.information("Debe seleccionar un registro");
                sap.ui.core.BusyIndicator.hide();
                return;
              }


              for(let i in aItemsTable)
              {
                  let oItemSet =  this.getView().byId("tabla_ok").getContextByIndex(aItemsTable[i]);
                  
                  let oItem = oItemSet.getObject();
                  //validar si alguno registro del bloque tiene problemas
                    let sResultado = await this.fnValidarEstadoSolicitud(oItem);
                    bProcesar = true;
                    if(sResultado != "P"){
                     // sap.m.MessageBox.error("Solicitud "+  oItem.PEDIDO + "-"+ oItem.POSPEDIDO +" ya fue evaluada");
                      this.aMensajesProceso.push("Solicitud "+  oItem.PEDIDO + "-"+ oItem.POSPEDIDO +" ya fue evaluada");
                    }else{
                  
                       if(oItem.FK_ZSD_TB_REGLAS_IDREGLA != null && oItem.FK_ZSD_TB_REGLAS_IDREGLA != "" ){
                            //obtener datos de la regla actual segun la secuencia
                            let oModel = this.getView().getModel("modeloReglaActual").getData().results;
                            let oReglaS =  oModel.filter(obj=>obj.IDREGLA == oItem.IDREGLA);
              
                            //obtenemos el primer registro
                            let oRegla = oReglaS[0];
                            let iNum1 = parseInt(oItem.CANTIDAD);
                            let iNum2 = parseInt(oRegla.CANTIDAD);
                            let iDif = iNum2 - iNum1;
              
                            let sFecha = formatter.fechaLocalHoyBD();
              
                            let oHora = new Date().toLocaleTimeString();
                            oRegla.CANTIDAD = iDif;
                            oRegla.USUARIO = this.usuario;
                            oRegla.HORACARGA = oHora;
              
                            let oReglaCreada = await this.fnCrearRegla(oRegla);
                            await this.fnActualizarSolicitudBTP(oItem, "A", sFecha, oHora, oRegla.PRECIOMIN, iNum2, oRegla.PORCENTAJEMIN, oRegla.IDREGLA);
                            await this.fnActualizarSolicitudECC(oItem, "A");

                          }else{
                            //se debe solo actualizar el registro no mas en la tabla BTP
  
                            let sFecha = formatter.fechaLocalHoyBD();

                            let oHora = new Date().toLocaleTimeString();

                            await this.fnActualizarSolicitudBTP(oItem, "A", sFecha, oHora, null, null, null, null);
                            await this.fnActualizarSolicitudECC(oItem, "A");
                          }

                     /* sap.m.MessageBox.confirm("¿Está seguro que desea aprobar esta solicitud: "+ oItem.PEDIDO + "-"+ oItem.POSPEDIDO  , {
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
                        
                    });*/
                    }
              }
              sap.ui.core.BusyIndicator.hide();
              if(bProcesar){
               // let oModelWP  = this.getOwnerComponent().getModel("srvCatalogoWP");
               // let oModelECC = this.getOwnerComponent().getModel("srvCatalogoECC");
                //mostrar mensajes:
                let sMensaje = "";
                let iApro = 0, iRech = 0;
                for(var ele in this.aMensajesProceso){
                  let obj = this.aMensajesProceso[ele];
                  if(obj.includes("Solicitud rechazada")){
                    iRech++;
                  }else if(obj.includes("Solicitud aprobada")){
                    iApro++;
                  }else 
                  {
                    sMensaje = sMensaje + obj + "\n";
                  }
                }
                if(iApro == 1){
                  sMensaje = sMensaje + "Se aprobó solicitud" + "\n";
                }else if(iApro > 1){
                  sMensaje = sMensaje + "Se aprobaron "+iApro+" solicitudes" + "\n";
                }

                if(iRech == 1){
                  sMensaje = sMensaje + "Se rechazó solicitud" + "\n";
                }else if(iRech > 1){
                  sMensaje = sMensaje + "Se rechazaron "+iRech+" solicitudes" + "\n";
                }
                sap.m.MessageBox.information(sMensaje);
                this.aMensajesProceso = [];
              }

            },

            fnProcesarRegistro: async function(oItem){

              let oModel = this.getView().getModel("modeloReglaActual").getData().results;
              let oReglaS =  oModel.filter(obj=>obj.IDREGLA == oItem.IDREGLA);

              //obtenemos el primer registro
              let oRegla = oReglaS[0];
              let iNum1 = parseInt(oItem.CANTIDAD);
              let iNum2 = parseInt(oRegla.CANTIDAD);
              let iDif = iNum2 - iNum1;

              let sFecha = formatter.fechaLocalHoyBD();

              let oHora = new Date().toLocaleTimeString();
              oRegla.CANTIDAD = iDif;
              oRegla.USUARIO = this.usuario;
              oRegla.HORACARGA = oHora;

              let oReglaCreada = await this.fnCrearRegla(oRegla);
              await this.fnActualizarSolicitudBTP(oItem, "A", sFecha, oHora, oRegla.PRECIOMIN, iNum2, oRegla.PORCENTAJEMIN, oRegla.IDREGLA);
              await this.fnActualizarSolicitudECC(oItem, "A");
          



            },


            _mergeBatch: function (oModel, sEntity, oEntry) {
                  return new Promise((resolve, reject) => {
                      oModel.update(sEntity, oEntry, {
                          groupId: "batchUpdate",
                          merge: true
                      })
                  })
              },

          _mergeBatchCreate: function (oModel, sEntity, oEntry) {
                return new Promise((resolve, reject) => {
                    oModel.create(sEntity, oEntry, {
                        groupId: "batchCreate",
                        merge: true
                    })
                })
            },

            _submitMerge: function(oModel){

                var that = this;
                return new Promise((resolve, reject) => {
                    oModel.submitChanges({
                        groupId: "batchUpdate",
                        success: function (oData) {

                            console.log(oData);
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError)
                            console.log(oError);
                        }
                    });
                })
            },

            _submitMergeCreate: function(oModel){

              var that = this;
              return new Promise((resolve, reject) => {
                  oModel.submitChanges({
                      groupId: "batchCreate",
                      success: function (oData) {

                          console.log(oData);
                          resolve(oData);
                      },
                      error: function (oError) {
                          reject(oError)
                          console.log(oError);
                      }
                  });
              })
          },
            

            fnActualizarSolicitudBTP: async function(pSolicitud, pEstado, pFechaAprobSol, pHoraAprobSol, pPrecioRegla, pCantRegla, pProcentRegla, pUUIDReglaCreada){

              const oPromise = await new Promise((resolve, reject) => {

           

              let that = this;
                                  
              let oModel  = this.getOwnerComponent().getModel("srvCatalogoWP");

              let sEntity = "/ZSD_TB_SOL_MAT_DCTO_BTP";
              var sPath = oModel.createKey(sEntity, {
                IDDCTOBTP: pSolicitud.IDDCTOBTP
              });

                
                  var mParameters = {};
                  
                  if(pEstado != null){mParameters.ESTATUS = pEstado};
                  if(pFechaAprobSol != null){
                    
                   // mParameters.FECHAAPROBSOL = formatter.dateToBD(pFechaAprobSol.FECHACARGA);
                    mParameters.FECHAAPROBSOL = pFechaAprobSol
                    
                  };
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

                 // this._mergeBatch(oModel,sEntity, mParameters );

         
                  oModel.update(sPath, mParameters, {
                      groupId: pSolicitud.IDDCTOBTP,
                      success: function(oReq, oRes){
                          if(pEstado == "R"){
                            //sap.m.MessageBox.information("Solicitud ");
                            that.aMensajesProceso.push("Solicitud rechazada "+  pSolicitud.PEDIDO + "-"+ pSolicitud.POSPEDIDO);

                          }else if(pEstado == "A"){
                            if(pSolicitud.CODMOTDERRECH == "006"){
                              //sap.m.MessageBox.information("");
                              that.aMensajesProceso.push("Solicitud "+  pSolicitud.PEDIDO + "-"+ pSolicitud.POSPEDIDO +" se aprobó con UMP Errónea, se debe corregir regla");

                            }
                            else{
                              //sap.m.MessageBox.information("Solicitud Aprobada correctamente.");
                              that.aMensajesProceso.push("Solicitud aprobada "+  pSolicitud.PEDIDO + "-"+ pSolicitud.POSPEDIDO);

                            }                                                    
                          }
                          resolve("");
                      },
                      error: function(oError){
                          if(oError.responseText){
                              let obj = JSON.parse(oError.responseText);
                              //MessageBox.error(obj.error.message.value);
                          }
                          resolve("");
                      }
                  });
                  
                });
          


                return oPromise;
            },

            fnActualizarSolicitudECC: async function(pRegistro, pEstado){

              const oPromise = await new Promise((resolve, reject) => {

           
    

              let oModel = this.getOwnerComponent().getModel("srvCatalogoECC");
              let sEntity  = "/SolicitudSet";
              let that = this;
            
              let oNewReg = {};
              oNewReg.Material  = pRegistro.CODMATERIAL;
              oNewReg.NroPedidoVM  = pRegistro.PEDIDO;
              oNewReg.Posicion         = pRegistro.POSPEDIDO;
              oNewReg.Status          = pEstado;
              oNewReg.Resultado          = "";

              
              
              try {

               // this._mergeBatchCreate(oModel, sEntity, oNewReg );

                
                  oModel.create(sEntity, oNewReg, {
                    success: function (oData, oResponse) {
                      let oDatos = oResponse.data;
                      resolve("");
                    },
                    error: function (oError) {
                     
                      console.log('SE PRODUJO UN ERROR: ' + oError)
                      resolve("");
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

            fnCrearRegla: async function(pRegistro){

              const oPromise = await new Promise((resolve, reject) => {

                console.log(pRegistro);
  
          
                let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                let that = this;
              
                let oNewReg = {};

                
                if(pRegistro.FECHACARGA){
//formatter.dateToBD(pRegistro.FECHACARGA);
                }

                oNewReg.FK_ZSD_TB_SECUENC_IDSECUENCIA  = pRegistro.FK_ZSD_TB_SECUENC_IDSECUENCIA;
                oNewReg.DESCRSEC           = pRegistro.DESCRSEC;
                oNewReg.FECHACARGA         = pRegistro.FECHACARGA;
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
                groupId: pSolicitud.IDDCTOBTP,
                success: function(oReq, oRes){
                    let oDatos = oRes.data;
                    resolve(oDatos.ESTATUS);
                    //sap.ui.core.BusyIndicator.hide();

                },
                error: function(oError){
                  //sap.ui.core.BusyIndicator.hide();
                  resolve("");
                }
              });


            });
            


              return oPromise;


   

            },



            fnObtenerUsuarioOLD: function(){

                this.usuario = "svidal@seidor.com";
  
                if (sap.ushell.Container !== undefined) {
                    let sEmail = sap.ushell.Container.getUser().getEmail();
                    if(sEmail){
                      this.usuario = sEmail;
                      this.fnObtenerDatoUsuario(this.usuario);
                    }
                  
                }
               
              },

            fnVerDetalle: function(oEvent) {

                let sPath = oEvent.getSource().getParent().getRowBindingContext().getPath();

                let oRegistro = this.getView().getModel("modeloSolicitudes").getProperty(sPath);

                //validar si se puede ir a detalle
                this.fnValidarNavegarDetalle(oRegistro);

            },

            
            fnValidarNavegarDetalle: function(pSolicitud){

              sap.ui.core.BusyIndicator.show(0);


              let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
              let sEntity = "/ZSD_TB_SOL_MAT_DCTO_BTP";
              let that = this;

              var sPath = oModel.createKey(sEntity, {
                IDDCTOBTP: pSolicitud.IDDCTOBTP,
                IsActiveEntity: true
            });

              
              oModel.read(sPath,{
                success: function(oReq, oRes){
        
                    let oDatos = oRes.data;
                    if(oDatos.ESTATUS != "P"){

                      sap.m.MessageBox.error("Solicitud ya fue evaluada");
                    }else{
                      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                      sap.ui.core.BusyIndicator.hide();
                      oRouter.navTo("RouteDetalle", {
                          id_solicitud: oDatos.IDDCTOBTP
                        });
                    }
                    
                 sap.ui.core.BusyIndicator.hide();

                },
                error: function(oError){
                  sap.ui.core.BusyIndicator.hide();
                    console.log(oError);
                }
              });

            },

            fnBuscarSolicitudesFiltros: function(){

              sap.ui.core.BusyIndicator.show(0);


                let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                let sEntity = "/ZSD_TB_SOL_MAT_DCTO_BTP";
                let that = this;

                let aFiltros = [];
                let oFilter = new sap.ui.model.Filter("ESTATUS", sap.ui.model.FilterOperator.EQ, "P");
                aFiltros.push(oFilter);

       
                let sFechHoyFormat = formatter.fechaLocalHoyBD();


                let oFilter2 = new sap.ui.model.Filter("FECHARECEPSOL", sap.ui.model.FilterOperator.EQ, sFechHoyFormat);
                aFiltros.push(oFilter2);

                let oFilter3 = new sap.ui.model.Filter("TIPOPROCES", sap.ui.model.FilterOperator.EQ, "M");
                aFiltros.push(oFilter3);

                let oFilter4 = new sap.ui.model.Filter("CODUSERAPROB", sap.ui.model.FilterOperator.EQ, this.usuarioBTP);
                aFiltros.push(oFilter4);

                let oFiltroFinal = new sap.ui.model.Filter({ filters: aFiltros, and: true });


                oModel.read(sEntity,{
                    filters: [oFiltroFinal],
                    sorters: [					
                      new sap.ui.model.Sorter("HORARECEPSOL", false)
                    ],
                    success: function(oReq, oRes){

                     
                      let oDatos = oRes.data;
                       //agrupar registros por fecha
                      //funcion para agrupar valores
                      function groupBy(array, f) {
                        var groups = {};
                        array.forEach(function(o) {
                            var group = JSON.stringify(f(o));
                            groups[group] = groups[group] || [];
                            groups[group].push(o);
                        });
                        return Object.keys(groups).map(function(group) {
                            return groups[group];
                        });
                      }


                       
                      let oModel = that.getView().getModel("modeloReglaActual").getData().results;
                      var iCantVendedor = 0;
                      var iCantPreventa = 0;
                      var iCantCallCenter = 0;
                      var iCantTradicional = 0;
                      var iCantFoodservice = 0;
                      var iCantIndustriales = 0;
                      var iCantGrandesClientes = 0;
                      var iCantSupermercados = 0;

                      if(oDatos.results.length == 0){

                          sap.m.MessageBox.information("Usted no dispone de solicitudes asignadas para evaluar");
                      }
                      else{

                        //agrupar registros disponibles por modelo, version y color
                        var datosAgrupados = groupBy(oDatos.results, function(item) {
                          return [item.FECHADESPACHO];
                        });

                        let modeloFechasAgrupadas =[];
                        for(var ele in datosAgrupados)
                        {
                          modeloFechasAgrupadas.push(datosAgrupados[ele][0].FECHADESPACHO);
                        }



                       console.log(modeloFechasAgrupadas);


                      
                      oDatos.results.forEach(function(elemento){
                       
                          let aEsta = oModel.filter(obj=>obj.FK_ZSD_TB_SECUENC_IDSECUENCIA == elemento.FK_ZSD_TB_SECUENC_IDSECUENCIA);
                          if(aEsta.length > 0){

                            let sDescSec = aEsta[0].DESCRSEC;
                            let aCampos = sDescSec.split("/");
                            let sDescSecDatos = "";
                            aCampos.forEach(element => {
                                sDescSecDatos = sDescSecDatos + elemento[element] + "/";
                            });

                            sDescSecDatos = sDescSecDatos.substring(0,sDescSecDatos.length -1 );

                            let oReglaS =  oModel.filter(obj=>obj.DESCRSECDATOS == sDescSecDatos);

                            if(oReglaS.length>0){
                              elemento.PRECIOREGLA = oReglaS[0].PRECIOMIN;
                              elemento.PROCENTREGLA = oReglaS[0].PORCENTAJEMIN;
                              elemento.CANTREGLA = oReglaS[0].CANTIDAD;
                              elemento.UMPRECIO  = oReglaS[0].UMPRECIO;
                              elemento.IDREGLA = oReglaS[0].IDREGLA;
                            }



                             
                          }

                          //asignar tipos de solicitudes
                          if(elemento.CODEJECUTIVO == elemento.CODVENDEDOR){
                            elemento.tipo_sol = "vendedor";iCantVendedor++;
                          }else if(elemento.CODEJECUTIVO == elemento.CODPREVENTA){
                            elemento.tipo_sol = "preventa";iCantPreventa++;
                          }else if(elemento.CODEJECUTIVO != elemento.CODPREVENTA && elemento.CODEJECUTIVO != elemento.CODVENDEDOR){
                            elemento.tipo_sol = "call_center";iCantCallCenter++;
                          }
                          
                          switch (elemento.DESCTIPOCLIENTE) {
                            case "Tradicional":
                                   elemento.tipo_cli = "tradicional"; iCantTradicional++;
                              break;
                              case "Foodservice":
                                elemento.tipo_cli = "foodservice"; iCantFoodservice++;
                           break;
                           case "Industriales":
                                   elemento.tipo_cli = "industriales";iCantIndustriales++;
                              break;
                              case "Grandes Clientes":
                                   elemento.tipo_cli = "grandes_clientes";iCantGrandesClientes++;
                              break;
                              case "Supermercados":
                                   elemento.tipo_cli = "supermercados";iCantSupermercados++;
                              break;
                    
                            default:
                              break;
                          }


                      });

                      //setear json model

                      
                      that.getView().getModel("modelDatos").getData().cantidades.CantTotal = oDatos.results.length;
                      that.getView().getModel("modelDatos").getData().cantidades.CantVendedor = iCantVendedor;
                      that.getView().getModel("modelDatos").getData().cantidades.CantPreventa = iCantPreventa;
                      that.getView().getModel("modelDatos").getData().cantidades.CantCallCenter = iCantCallCenter; 
                      that.getView().getModel("modelDatos").getData().cantidades.CantTradicional = iCantTradicional;
                      that.getView().getModel("modelDatos").getData().cantidades.CantFoodservice = iCantFoodservice;
                      that.getView().getModel("modelDatos").getData().cantidades.CantIndustriales = iCantIndustriales;
                      that.getView().getModel("modelDatos").getData().cantidades.CantGrandesClientes = iCantGrandesClientes;
                      that.getView().getModel("modelDatos").getData().cantidades.CantSupermercados = iCantSupermercados;

                      that.getView().getModel("modelDatos").refresh();

                      let oJsonModel = new sap.ui.model.json.JSONModel(oDatos);
                      oJsonModel.setSizeLimit(10000);
                      that.getView().setModel(oJsonModel, "modeloSolicitudes");
                      that.getView().getModel("modeloSolicitudes").refresh();
                     }

                      sap.ui.core.BusyIndicator.hide();
                     

                    },
                    error: function(oError){
                        console.log(oError);

                        sap.ui.core.BusyIndicator.hide();
                    }
                });

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

            fnBuscarSolicitudes: function(){

              sap.ui.core.BusyIndicator.show(0);
      

                let oModel = this.getOwnerComponent().getModel("srvCatalogoWP");
                let sEntity = "/ZSD_TB_SOL_MAT_DCTO_BTP";
                let that = this;

                oModel.read(sEntity,{
                    success: function(oReq, oRes){
                        let oDatos = oRes.data;
                        let oModel = that.getView().getModel("modeloReglaActual").getData().results;
                        var iCantVendedor = 0;
                        var iCantPreventa = 0;
                        var iCantCallCenter = 0;
                        var iCantTradicional = 0;
                        var iCantFoodservice = 0;
                        var iCantIndustriales = 0;
                        var iCantGrandesClientes = 0;
                        var iCantSupermercados = 0;

                        oDatos.results.forEach(function(elemento){
                         
                            let aEsta = oModel.filter(obj=>obj.FK_ZSD_TB_SECUENC_IDSECUENCIA == elemento.FK_ZSD_TB_SECUENC_IDSECUENCIA);
                            if(aEsta.length > 0){

                              let sDescSec = aEsta[0].DESCRSEC;
                              let aCampos = sDescSec.split("/");
                              let sDescSecDatos = "";
                              aCampos.forEach(element => {
                                  sDescSecDatos = sDescSecDatos + elemento[element] + "/";
                              });
  
                              sDescSecDatos = sDescSecDatos.substring(0,sDescSecDatos.length -1 );
  
                              let oReglaS =  oModel.filter(obj=>obj.DESCRSECDATOS == sDescSecDatos);

                              if(oReglaS.length>0){
                                elemento.PRECIOREGLA = oReglaS[0].PRECIOMIN;
                                elemento.PROCENTREGLA = oReglaS[0].PORCENTAJEMIN;
                                elemento.CANTREGLA = oReglaS[0].CANTIDAD;
                                elemento.UMPRECIO  = oReglaS[0].UMPRECIO;
                                elemento.IDREGLA = oReglaS[0].IDREGLA;
                              }



                               
                            }

                            //asignar tipos de solicitudes
                            if(elemento.CODEJECUTIVO == elemento.CODVENDEDOR){
                              elemento.tipo_sol = "vendedor";iCantVendedor++;
                            }else if(elemento.CODEJECUTIVO == elemento.CODPREVENTA){
                              elemento.tipo_sol = "preventa";iCantPreventa++;
                            }else if(elemento.CODEJECUTIVO != elemento.CODPREVENTA && elemento.CODEJECUTIVO != elemento.CODVENDEDOR){
                              elemento.tipo_sol = "call_center";iCantCallCenter++;
                            }
                            
                            switch (elemento.DESCTIPOCLIENTE) {
                              case "Tradicional":
                                     elemento.tipo_cli = "tradicional"; iCantTradicional++;
                                break;
                                case "Foodservice":
                                  elemento.tipo_cli = "foodservice"; iCantFoodservice++;
                             break;
                             case "Industriales":
                                     elemento.tipo_cli = "industriales";iCantIndustriales++;
                                break;
                                case "Grandes Clientes":
                                     elemento.tipo_cli = "grandes_clientes";iCantGrandesClientes++;
                                break;
                                case "Supermercados":
                                     elemento.tipo_cli = "supermercados";iCantSupermercados++;
                                break;
                      
                              default:
                                break;
                            }


                        });

                        //setear json model

                        
                        that.getView().getModel("modelDatos").getData().cantidades.CantTotal = oDatos.results.length;
                        that.getView().getModel("modelDatos").getData().cantidades.CantVendedor = iCantVendedor;
                        that.getView().getModel("modelDatos").getData().cantidades.CantPreventa = iCantPreventa;
                        that.getView().getModel("modelDatos").getData().cantidades.CantCallCenter = iCantCallCenter; 
                        that.getView().getModel("modelDatos").getData().cantidades.CantTradicional = iCantTradicional;
                        that.getView().getModel("modelDatos").getData().cantidades.CantFoodservice = iCantFoodservice;
                        that.getView().getModel("modelDatos").getData().cantidades.CantIndustriales = iCantIndustriales;
                        that.getView().getModel("modelDatos").getData().cantidades.CantGrandesClientes = iCantGrandesClientes;
                        that.getView().getModel("modelDatos").getData().cantidades.CantSupermercados = iCantSupermercados;

                        that.getView().getModel("modelDatos").refresh();

                        let oJsonModel = new sap.ui.model.json.JSONModel(oDatos);
                        oJsonModel.setSizeLimit(10000);
                        that.getView().setModel(oJsonModel, "modeloSolicitudes");
                        that.getView().getModel("modeloSolicitudes").refresh();

                        sap.ui.core.BusyIndicator.hide();
                       

                    },
                    error: function(oError){
                        console.log(oError);
                        sap.ui.core.BusyIndicator.hide();
                    }
                });

            },

            fnOdataTestPost: function(){
      
              let oModel = this.getOwnerComponent().getModel("srvCatalogoECC");
              let that = this; 
              let oNewReg = {};
              oNewReg.Material     = "1010001";
              oNewReg.NroPedidoVM  = "519317202";
              oNewReg.Posicion     = "000060";
              oNewReg.Status       = "R";
              oNewReg.Resultado    = "TEST";
        
              try {

                  oModel.create("/SolicitudSet", oNewReg, {
                    success: function (oData, oResponse) {
                      let oDatos = oResponse.data;
                      console.log(oResponse);
                    },
                    error: function (oError) {
                     
                      console.log(oError);
                    },
                  });
                }
                catch (err) {
                  let oDatos = oRes.data;
                
                }


           }

/*
            fnOdataGet: function(){


              let oModel = this.getOwnerComponent().getModel("srvCatalogoSol");
              let sEntity = "/ParametrosSet?&$filter= FechaRecepSol eq datetime'2021-08-16T10:00:00' and HoraRecepSol ge time'PT00H00M00S' and Estatus eq 'P'&$expand=Parametros_to_Solicitudes";
              let that = this;

              oModel.read(sEntity,{
                  success: function(oReq, oRes){
                      let oDatos = oRes.data;
                      console.log(oDatos);

                               },
                  error: function(oError){
                      console.log(oError);
                  }
              });


           },

  */

        });
    });

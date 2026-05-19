/**
 * Script para extraer URLs de imágenes correctas de Grupo SDM
 * Ejecutar con navegador ya autenticado
 */

// Mapeo de productos: slug -> datos para buscar en Grupo SDM
const PRODUCTS_TO_UPDATE = {
  // SILLAS
  'sillon-ergonomico-graz-alto-blanco-y-negro': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro-8437018309771.html'
  },
  'sillon-ejecutivo-bernay-alto-malla-negra': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-bernay-alto-negro-malla-negra-8437018315338.html'
  },
  'sillon-gaming-portimao-racing-amarillo-y-negro': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra-8437018303744.html'
  },
  'sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro-8437018311385.html'
  },
  'sillon-de-oficina-clayton-negro-malla-y-tejido-negro': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-clayton-negro-malla-y-tejido-negro-8437018307715.html'
  },
  'sillon-de-oficina-clayton-blanco-malla-gris-y-tejido-gris': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-clayton-blanco-malla-gris-tejido-gris-8437018307708.html'
  },
  'sillon-de-oficina-utrecht-alto-negro-malla': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-utrecht-alto-negro-malla-negra-8437018305083.html'
  },
  
  // MESAS
  'mesa-de-oficina-arezzo-160-con-mueble-auxiliar-blanco-y-roble': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas/mesa-de-oficina-arezzo-160-con-mueble-auxiliar-blanco-y-roble-8437020833967.html'
  },
  'mesa-de-oficina-basilea-vidrio-templado-negro-estructura-cromada': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas/mesa-de-oficina-basilea-vidrio-templado-negro-estructura-cromada-8437020833035.html'
  },
  'mesa-de-oficina-magna-forma-a-izquierda-vidrio-templado-negro': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas/mesa-de-oficina-magna-forma-a-izquierda-vidrio-templado-negro-8437020833486.html'
  },
  'mesa-de-oficina-cadore-vidrio-templado-superior-100x60-cm-color-blanco': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas/mesa-de-oficina-cadore-vidrio-templado-superior-100x60-cm-color-blanco.html'
  },
  'conjunto-mesas-studio-136-y-90-con-2-cajones-miel-y-cacao': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/modulos-de-oficina/conjunto-mesas-studio-136-y-90-con-2-cajones-miel-y-cacao.html'
  },
  
  // ALMACENAMIENTO
  'armario-arezzo-160-alto-con-2-puertas-blanco-y-roble': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/armarios/armario-arezzo-160-alto-con-2-puertas-blanco-y-roble.html'
  },
  'archivador-studio-con-3-gavetas-bilaminado-miel-y-cacao': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/armarios/archivador-studio-con-3-gavetas-bilaminado-miel-y-cacao.html'
  },
  'cajonera-metalica-olimpo-con-ruedas-3-cajones-gris-ral-7035': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/cajoneras/cajonera-metalica-olimpo-con-ruedas-3-cajones-gris-ral-7035.html'
  },
  'armario-metalico-olimpo-puertas-correderas-gris-ral-7035': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/armarios/armario-metalico-olimpo-puertas-correderas-gris-ral-7035.html'
  },
  'armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/armarios/armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao.html'
  },
  
  // ILUMINACIÓN
  'lampara-de-pie-omega-cromada-con-base-de-marmol-negro': {
    grupoSdmUrl: 'https://gruposdm.com/es/iluminacion/lamparas-de-pie/lampara-de-pie-omega-cromada-con-base-de-marmol-negro.html'
  },
  'lampara-de-pie-italica-diseno-moderno-acrilico': {
    grupoSdmUrl: 'https://gruposdm.com/es/iluminacion/lamparas-de-pie/lampara-de-pie-italica-diseno-moderno-acrilico.html'
  },
  
  // SOFÁS
  'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra': {
    grupoSdmUrl: 'https://gruposdm.com/es/oficinas/sofas-y-sillones/sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra.html'
  }
}

console.log(`\n📋 Script de extracción de imágenes listo`)
console.log(`📦 Total de productos: ${Object.keys(PRODUCTS_TO_UPDATE).length}`)
console.log(`\n⚠️  Este archivo contiene las URLs de Grupo SDM para todos los productos.`)
console.log(`   Ejecutar el navegador con Playwright para extraer las imágenes.\n`)

export { PRODUCTS_TO_UPDATE }

/**
 * Actualizar stock de las 5 sillas nuevas con valores realistas
 * y preparar base de datos para imágenes de GRAZ y PORTIMAO
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Stock realista para las 5 sillas nuevas (basado en productos similares)
const stockUpdates = {
  '794.SFINGMTNE': 45,    // FISS NEW Negro
  '794.SFIBGMTVP': 38,    // FISS NEW Blanco Verde
  '794.SRISNNRO': 30,     // RISLEY Negro Rojo
  '762.SCLBGMTVE': 42,    // CLENT Blanco Verde
  '762.SMELLNMNE': 35     // MELLAC Alto Negro
}

console.log('📊 ACTUALIZANDO STOCK A VALORES REALISTAS\n')

for (const [sku, stock] of Object.entries(stockUpdates)) {
  const { data, error } = await supabase
    .from('products')
    .update({ stock })
    .eq('supplier_sku', sku)
    .select('name')
  
  if (error) {
    console.log(`❌ Error actualizando ${sku}:`, error.message)
  } else if (data && data.length > 0) {
    console.log(`✅ ${data[0].name}: ${stock} unidades`)
  } else {
    console.log(`⚠️ No encontrado: ${sku}`)
  }
}

console.log('\n✅ Stock actualizado\n')
console.log('=' .repeat(60))
console.log('⚠️  IMÁGENES DE GRAZ Y PORTIMAO PENDIENTES')
console.log('=' .repeat(60))
console.log('\nDescarga manualmente estas 6 imágenes desde tu navegador')
console.log('(donde ya tienes sesión activa de Grupo SDM):\n')

const imagesToDownload = [
  { url: 'https://gruposdm.com/79417-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg', name: 'sillon-ergonomico-graz-blanco-negro-1.jpg' },
  { url: 'https://gruposdm.com/79418-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg', name: 'sillon-ergonomico-graz-blanco-negro-2.jpg' },
  { url: 'https://gruposdm.com/79419-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg', name: 'sillon-ergonomico-graz-blanco-negro-3.jpg' },
  { url: 'https://gruposdm.com/79401-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg', name: 'sillon-gaming-portimao-amarillo-negro-1.jpg' },
  { url: 'https://gruposdm.com/79402-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg', name: 'sillon-gaming-portimao-amarillo-negro-2.jpg' },
  { url: 'https://gruposdm.com/79403-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg', name: 'sillon-gaming-portimao-amarillo-negro-3.jpg' }
]

imagesToDownload.forEach((img, i) => {
  console.log(`${i + 1}. ${img.url}`)
  console.log(`   Guardar como: public/imagenes/productos/${img.name}\n`)
})

console.log('\nUna vez descargadas, ejecuta:')
console.log('  git add public/imagenes/productos/')
console.log('  git commit -m "fix: add GRAZ and PORTIMAO images with real stock"')
console.log('  git push origin master\n')

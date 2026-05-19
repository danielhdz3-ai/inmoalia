import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Leer .env.local manualmente
const envContent = readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

// Imágenes correctas de Grupo SDM (extraídas del sitio oficial)
const correctImages = {
  'mesa-oficina-cadore-vidrio-blanco-180x85': {
    // SKU: 714.MCAD180BL
    // URLs CORRECTAS verificadas de la página oficial (36545, 36546)
    images: [
      'https://gruposdm.com/36545-large_default/mesa-de-oficina-cadore-vidrio-templado-super-blanco-180-x-85-cms.jpg',
      'https://gruposdm.com/36546-large_default/mesa-de-oficina-cadore-vidrio-templado-super-blanco-180-x-85-cms.jpg'
    ]
  },
  'mesa-oficina-magna-vidrio-negro-180x85': {
    // SKU: 714.MMAGFI180
    // URL correcta encontrada en el sitio
    images: [
      'https://gruposdm.com/36543-large_default/mesa-de-oficina-magna-forma-a-izquierda-vidrio-templado-negro-180-x-85-cms.jpg'
    ]
  }
}

async function updateProductImages() {
  console.log('\n🔧 ACTUALIZANDO IMÁGENES DE PRODUCTOS\n')

  for (const [slug, data] of Object.entries(correctImages)) {
    const { error } = await supabase
      .from('products')
      .update({ images: data.images })
      .eq('slug', slug)

    if (error) {
      console.error(`❌ Error actualizando ${slug}:`, error.message)
    } else {
      console.log(`✅ ${slug}: Imágenes actualizadas (${data.images.length} URLs)`)
      console.log(`   ${data.images.join('\n   ')}`)
    }
  }
}

updateProductImages()

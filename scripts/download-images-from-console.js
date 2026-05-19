/**
 * COPIAR Y PEGAR EN LA CONSOLA DEL NAVEGADOR (F12) CUANDO ESTÉS EN GRUPOSDM.COM
 * 
 * Este script descarga las imágenes de GRAZ y PORTIMAO usando tu sesión activa
 */

(async function downloadImages() {
  const images = [
    // GRAZ
    { url: 'https://gruposdm.com/79417-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg', name: 'sillon-ergonomico-graz-blanco-negro-1.jpg' },
    { url: 'https://gruposdm.com/79418-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg', name: 'sillon-ergonomico-graz-blanco-negro-2.jpg' },
    { url: 'https://gruposdm.com/79419-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg', name: 'sillon-ergonomico-graz-blanco-negro-3.jpg' },
    // PORTIMAO
    { url: 'https://gruposdm.com/79401-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg', name: 'sillon-gaming-portimao-amarillo-negro-1.jpg' },
    { url: 'https://gruposdm.com/79402-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg', name: 'sillon-gaming-portimao-amarillo-negro-2.jpg' },
    { url: 'https://gruposdm.com/79403-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg', name: 'sillon-gaming-portimao-amarillo-negro-3.jpg' }
  ]

  console.log('🚀 Iniciando descarga de 6 imágenes...\n')

  for (const img of images) {
    try {
      console.log(`📥 Descargando ${img.name}...`)
      
      const response = await fetch(img.url)
      const blob = await response.blob()
      
      // Crear link de descarga
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = img.name
      link.click()
      
      console.log(`✅ ${img.name} (${Math.round(blob.size / 1024)} KB)`)
      
      // Esperar 500ms entre descargas
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (err) {
      console.error(`❌ Error descargando ${img.name}:`, err)
    }
  }

  console.log('\n✅ Descarga completada!')
  console.log('📂 Mueve los archivos a: D:\\Proyectos\\inmoalia\\public\\imagenes\\productos\\')
})()

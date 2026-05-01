import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/shop/CartDrawer'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f9f6f1]">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  )
}

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/shop/CartDrawer'
import { AccountDashboardLayout } from '@/components/account/AccountDashboardLayout'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <AccountDashboardLayout>{children}</AccountDashboardLayout>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

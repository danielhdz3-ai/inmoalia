import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/shop/CartDrawer'
import { AccountDashboardLayout } from '@/components/account/AccountDashboardLayout'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>
      <main className="min-h-screen print:min-h-0">
        <AccountDashboardLayout>{children}</AccountDashboardLayout>
      </main>
      <div className="print:hidden">
        <Footer />
        <CartDrawer />
      </div>
    </>
  )
}

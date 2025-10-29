import { Providers } from '@/redux/Providers'
import './globals.css'
import { Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { UIProvider } from '@/contexts/UIcontext'
import AppWrapper from '@/contexts/AppWrapper'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata = {
  title: 'Tech4Logic',
  description: 'Your app description',
  
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <UIProvider>
          <Providers>
            <AppWrapper>{children}</AppWrapper>
          </Providers>
        </UIProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  )
}

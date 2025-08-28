'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import logo from '../../../public/png/logo.png'

const HeaderLogReg = () => {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow px-6 md:px-20 py-3 flex items-center justify-start">
      <div
        className="cursor-pointer"
        onClick={() => router.push('/')}
      >
        <Image src={logo} alt="Logo" height={50} />
      </div>
    </header>
  )
}

export default HeaderLogReg

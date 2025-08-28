'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import Link from 'next/link'

import logo from '@/../public/png/logo.png'
import signupImg from "../../../public/png/signup.jpg"

import { ContainedButton } from '@/components/custom/ui/Buttons'
import { SelectInput, TextInput } from '@/components/custom/inputs'

import { useRegisterMutation } from '@/redux/features/api/authApi'
import { setCredentials } from '@/redux/features/slices/authSlice'
import { useUI } from '@/contexts/UIcontext'
import { handleApiError } from '@/utils/apiError'
import { userApi } from '@/redux/features/api/userApi'

import countryList from 'react-select-country-list'
import { showError, showSuccess } from '@/utils/customAlert'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const countries = useMemo(() => countryList().getData(), [])
  const [country, setCountry] = useState(() => countries.find(c => c.label === 'India') || { label: '', value: '' })

  const router = useRouter()
  const dispatch = useDispatch()
  const { showLoader, hideLoader } = useUI()
  const [register] = useRegisterMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      await showError("Passwords don't match", 'Please ensure both passwords are identical.')
      return
    }

    if (!/^\d{10}$/.test(mobile)) {
      await showError('Invalid Mobile Number', 'Enter a valid 10-digit mobile number.')
      return
    }

    try {
      showLoader()
      const res = await register({
        name,
        email,
        mobile,
        password,
        companyName,
        country,
      }).unwrap()

      dispatch(setCredentials(res))
      dispatch(userApi.util.resetApiState())

      await showSuccess('Signup Successful', 'Welcome! Your account has been created.')
      router.push('/profile')
    } catch (err) {
      await showError('Signup Failed', handleApiError(err, 'Something went wrong.'))

      if (process.env.NODE_ENV === 'development') {
        console.error('Signup error:', err)
      }
    } finally {
      hideLoader()
    }
  }

  return (
    <div className="flex h-screen justify-center overflow-hidden bg-gray-50 pt-18">
      {/* Left Panel */}
      <div className="w-full h-full overflow-y-auto px-4 sm:px-8 md:px-16 lg:px-20 py-6 md:w-[70%] lg:w-1/2 xl:w-[60%] 2xl:w-[65%] bg-gray-50">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg 2xl:max-w-xl mx-auto flex flex-col min-h-full">
          {/* Top Section */}
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mt-2">Register</h2>
            <p className="text-sm text-gray-500 mt-1">Create new account</p>
          </div>

          {/* Form */}
          <form className="flex-grow space-y-5" onSubmit={handleSubmit}>
            <TextInput
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextInput
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextInput
              label="Mobile Number"
              name="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            <TextInput
              label="Company Name"
              name="company"
              type="text"
              placeholder="Your Company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <SelectInput
              label="Country"
              options={countries}
              value={country}
              onChange={setCountry}
              required
            />
            <TextInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <ContainedButton type="submit" className="w-full py-3">
              Sign Up
            </ContainedButton>
          </form>

          {/* Bottom */}
          <div className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-700 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-200">
        <Image
          src={signupImg}
          alt="Signup visual"
          width={'auto'}
          height={800}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'

import { useRegisterMutation } from '@/redux/features/api/authApi'
import { setCredentials } from '@/redux/features/slices/authSlice'
import { useUI } from '@/contexts/UIcontext'
import { handleApiError } from '@/utils/apiError'

import countryList from 'react-select-country-list'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')

  const router = useRouter()
  const dispatch = useDispatch()

  const [register] = useRegisterMutation()
  const { showLoader, hideLoader } = useUI()

  // Memoized list of country options
  const countries = useMemo(() => countryList().getData(), [])
  const [country, setCountry] = useState(() => {
    const defaultCountry = countryList().getData().find((c) => c.label === 'India')
    return defaultCountry || { label: '', value: '' }
  })

  const handleCountryChange = (e) => {
    const selected = countries.find((c) => c.label === e.target.value)
    if (selected) setCountry(selected)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    if (!/^[0-9]{6,15}$/.test(mobile)) {
      toast.error("Enter a valid mobile number.")
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
      toast.success('Signup successful!')
      router.push('/profile')
    } catch (err) {
      toast.error(handleApiError(err, 'Signup failed.'))
      if (process.env.NODE_ENV === 'development') {
        console.error('Signup error:', err)
      }
    } finally {
      hideLoader()
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center relative w-full overflow-hidden">
      <div className="absolute top-0 left-0 w-40 h-40 border-t border-l border-white/10 rounded-tr-3xl rotate-45 opacity-20" />
      <div className="absolute bottom-0 right-0 w-40 h-40 border-b border-r border-white/10 rounded-tl-3xl rotate-45 opacity-20" />

      <div className="bg-white p-8 rounded-md shadow-xl w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-4">
          <div className="bg-indigo-700 text-white px-3 py-1 rounded-md font-medium text-lg">
            Tech 4 Logic
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-800">Sign Up</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Create your account</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 border-b border-gray-300 focus:outline-none focus:border-indigo-600"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border-b border-gray-300 focus:outline-none focus:border-indigo-600"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full mt-1 border-b border-gray-300 focus:outline-none focus:border-indigo-600"
              placeholder="9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full mt-1 border-b border-gray-300 focus:outline-none focus:border-indigo-600"
              placeholder="Acme Pvt Ltd"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Country</label>
            <select
              value={country.label}
              onChange={handleCountryChange}
              className="w-full mt-1 border-b border-gray-300 focus:outline-none focus:border-indigo-600 bg-white"
              required
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.value} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 border-b border-gray-300 focus:outline-none focus:border-indigo-600"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 border-b border-gray-300 focus:outline-none focus:border-indigo-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-medium py-2 rounded-md transition"
          >
            Sign Up
          </button>

          <p className="text-sm text-center text-gray-500 mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'
import {Store} from 'lucide-react'

function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const [passwordStrength, setPasswordStrength] = useState(0)

    const calculatePasswordStrength = (pwd) => {
        let strength = 0
        if (pwd.length >= 8) strength++
        if (/[A-Z]/.test(pwd)) strength++
        if (/[0-9]/.test(pwd)) strength++
        if (/[^A-Za-z0-9]/.test(pwd)) strength++
        setPasswordStrength(strength)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (name === 'password') {
            calculatePasswordStrength(value)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const { firstName, lastName, username, email, password, confirmPassword, phoneNumber } = formData

            if (!firstName || !lastName || !username || !email || !password || !confirmPassword || !phoneNumber) {
                setError('Please fill in all fields')
                return
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters long')
                return
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match')
                return
            }

            await registerUser({
                firstName,
                lastName,
                username,
                email,
                phoneNumber,
                password,
            })

            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-400'
        if (passwordStrength === 2) return 'bg-yellow-400'
        if (passwordStrength === 3) return 'bg-blue-400'
        return 'bg-green-400'
    }

    const getPasswordStrengthLabel = () => {
        if (passwordStrength === 0) return ''
        if (passwordStrength <= 1) return 'Weak'
        if (passwordStrength === 2) return 'Fair'
        if (passwordStrength === 3) return 'Good'
        return 'Strong'
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-sky-50 to-slate-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 rounded-lg bg-linear-to-br from-sky-400 to-sky-600 shadow-lg mb-4 w-12 h-12 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold"><Store/></span>
                    </div>
                    <h1 className="text-3xl font-bold text-sky-600">BillFlow</h1>
                    <p className="text-slate-600 text-sm mt-1">Join millions of satisfied users</p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
                    <p className="text-slate-600 text-sm mb-6">Get started with BillFlow in minutes</p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="9876543210"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all ${
                                                    i < passwordStrength ? getPasswordStrengthColor() : 'bg-slate-200'
                                                }`}
                                            ></div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        Password strength:{' '}
                                        <span className={`font-semibold ${
                                            passwordStrength <= 1 ? 'text-red-600' :
                                            passwordStrength === 2 ? 'text-yellow-600' :
                                            passwordStrength === 3 ? 'text-blue-600' :
                                            'text-green-600'
                                        }`}>
                                            {getPasswordStrengthLabel()}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 w-4 h-4 border border-slate-300 rounded accent-sky-600 cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                                I agree to the{' '}
                                <NavLink to="#" className="text-sky-600 hover:text-sky-700 font-medium">
                                    Terms of Service
                                </NavLink>
                                {' '}and{' '}
                                <NavLink to="#" className="text-sky-600 hover:text-sky-700 font-medium">
                                    Privacy Policy
                                </NavLink>
                            </label>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-linear-to-r from-sky-500 to-sky-600 text-white font-semibold py-2.5 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-xs text-slate-500">Already have an account?</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Login Link */}
                    <NavLink
                        to="/login"
                        className="block w-full border border-sky-300 text-sky-600 font-semibold py-2.5 rounded-lg hover:bg-sky-50 transition-all text-center"
                    >
                        Sign In
                    </NavLink>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    Protected by industry-leading security
                </p>
            </div>
        </div>
    )
}

export default Register
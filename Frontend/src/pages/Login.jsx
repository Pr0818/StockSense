import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthStore'
import { loginUser } from '../services/authService'
import { Package } from 'lucide-react'

function Login() {
    const email = useAuth((state) => state.email)
    const setEmail = useAuth((state) => state.setEmail)
    const setUser = useAuth((state) => state.setUser)
    const setUserName = useAuth((state) => state.setUserName)
    const setAuthToken = useAuth((state) => state.setAuthToken)

    const [username, setUsername] = useState('')
    const [mobile, setMobile] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            if (!username || !mobile || !password) {
                setError('Please enter your username, mobile number and password')
                return
            }

            const response = await loginUser({
                username,
                mobile,
                password
            })

            setUser({ username, mobile })
            setUserName(username)
            setAuthToken(response.token)

            localStorage.setItem('authToken', response.token)
            localStorage.setItem('mobile', mobile)

            // Redirect to StockSense Inventory Dashboard
            navigate('/dashboard')

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Login failed. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">

            <div className="w-full max-w-md">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">

                    <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 shadow-lg mb-4 w-14 h-14 flex items-center justify-center">
                        <Package className="text-white w-7 h-7" />
                    </div>

                    <h1 className="text-3xl font-bold text-blue-600">
                        StockSense
                    </h1>

                    <p className="text-slate-600 text-sm mt-1">
                        Smart Inventory Management System
                    </p>

                </div>


                {/* Login Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Welcome Back
                    </h2>

                    <p className="text-slate-600 text-sm mb-6">
                        Sign in to manage your inventory
                    </p>


                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">
                                {error}
                            </p>
                        </div>
                    )}


                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Username Field */}
                        <div>

                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />

                        </div>


                        {/* Mobile Number Field */}
                        <div>

                            <label
                                htmlFor="mobile"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Mobile Number
                            </label>

                            <input
                                id="mobile"
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="Enter your mobile number"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />

                        </div>


                        {/* Password Field */}
                        <div>

                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>

                            </div>

                        </div>


                        {/* Forgot Password */}
                        <div className="flex justify-end">

                            <NavLink
                                to="/forgot-password"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Forgot password?
                            </NavLink>

                        </div>


                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                    </form>


                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">

                        <div className="flex-1 h-px bg-slate-200"></div>

                        <span className="text-xs text-slate-500">
                            New to StockSense?
                        </span>

                        <div className="flex-1 h-px bg-slate-200"></div>

                    </div>


                    {/* Register Link */}
                    <NavLink
                        to="/register"
                        className="block w-full border border-blue-300 text-blue-600 font-semibold py-2.5 rounded-lg hover:bg-blue-50 transition-all text-center"
                    >
                        Create Account
                    </NavLink>

                </div>


                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">

                    By signing in, you agree to our{' '}

                    <NavLink
                        to="#"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Terms of Service
                    </NavLink>

                    {' '}and{' '}

                    <NavLink
                        to="#"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Privacy Policy
                    </NavLink>

                </p>

            </div>

        </div>
    )
}

export default Login


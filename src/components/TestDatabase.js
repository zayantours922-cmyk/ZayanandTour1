import React, { useState, useEffect } from 'react'
import { getPackages, getVehicles, getDrivers } from '../services/luxelanka'

export default function TestDatabase() {
    const [packages, setPackages] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        testConnection()
    }, [])

    async function testConnection() {
        try {
            setLoading(true)
            
            // Fetch data from all tables
            const [packagesData, vehiclesData, driversData] = await Promise.all([
                getPackages(),
                getVehicles(),
                getDrivers()
            ])
            
            setPackages(packagesData || [])
            setVehicles(vehiclesData || [])
            setDrivers(driversData || [])
            setError(null)
            
        } catch (err) {
            console.error('Connection error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>🔄 Connecting to Supabase...</h2>
                <p>Fetching your LuxeLanka data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h2>❌ Connection Failed</h2>
                <p>Error: {error}</p>
                <details>
                    <summary>Troubleshooting Tips</summary>
                    <ul>
                        <li>Check your .env.local file has correct URL and ANON_KEY</li>
                        <li>Verify tables exist in Supabase (Packages, Vehicles, Drivers)</li>
                        <li>Check if RLS policies allow public access</li>
                        <li>Restart your development server (npm run dev)</li>
                    </ul>
                </details>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>✅ Supabase Connected Successfully!</h1>
            
            {/* Packages Section */}
            <section style={{ marginBottom: '30px' }}>
                <h2>📦 Packages ({packages.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {packages.map(pkg => (
                        <div key={pkg.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                            <h3>{pkg.title}</h3>
                            <p>{pkg.description}</p>
                            <p><strong>Price:</strong> {pkg.price !== '' && pkg.price != null ? `$${pkg.price}` : 'Contact for price'}</p>
                            <p><strong>Category:</strong> {pkg.category}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vehicles Section */}
            <section style={{ marginBottom: '30px' }}>
                <h2>🚗 Vehicles ({vehicles.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {vehicles.map(vehicle => (
                        <div key={vehicle.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                            <h3>{vehicle.name}</h3>
                            <p>{vehicle.description}</p>
                            <p><strong>Price:</strong> {vehicle.price_per_day !== '' && vehicle.price_per_day != null ? `$${vehicle.price_per_day}/day` : 'Contact for price'}</p>
                            <p><strong>Category:</strong> {vehicle.category}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Drivers Section */}
            <section>
                <h2>👨‍✈️ Drivers ({drivers.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {drivers.map(driver => (
                        <div key={driver.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                            <h3>{driver.name}</h3>
                            <p>{driver.bio}</p>
                            <p><strong>Experience:</strong> {driver.experience_years} years</p>
                            <p><strong>Specialty:</strong> {driver.specialty}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
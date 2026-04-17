/**
 * Step1_OrgProfile.jsx
 * HRcopilot Organizational Intelligence Widget
 * Part of: Phase 3 — Core UI
 * Org types supported: both
 * Dependencies: data/orgTypeProfiles.js, engine/OrgProfileEngine.js
 * Demo IDs: none
 * Integration: OrganizationalIntelligenceWidget
 */

import React, { useState } from 'react'
import { ORG_TYPES, COMMERCIAL_TYPES, NGO_TYPES } from '../data/orgTypeProfiles.js'

const TECH_MATURITY_OPTIONS = [
  { value: 'manual', label: 'Manual / Paper-based' },
  { value: 'basic', label: 'Basic Digital (Spreadsheets)' },
  { value: 'integrated', label: 'Integrated Systems' },
  { value: 'automated', label: 'Fully Automated' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'CAD', 'AUD', 'INR', 'BRL', 'MXN', 'SGD', 'AED', 'SAR']

export default function Step1_OrgProfile({ onComplete }) {
  const [form, setForm] = useState({
    orgType: '',
    headcount: '',
    annualPayroll: '',
    annualRevenue: '',
    annualBudget: '',
    currency: 'USD',
    techMaturity: 'basic',
    countriesOfOperation: '1',
    programmeEfficiencyRatio: '',
    costPerBeneficiary: '',
  })
  const [errors, setErrors] = useState({})
  const [selectedSector, setSelectedSector] = useState('commercial') // 'commercial' or 'ngo'

  const selectedType = ORG_TYPES[form.orgType]
  const isNGO = selectedType?.sector === 'ngo'
  const isCommercial = selectedType?.sector === 'commercial'

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // Clear error for this field if it exists
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const validate = () => {
    const e = {}
    if (!form.orgType) e.orgType = 'Select an organization type'
    if (!form.headcount || Number(form.headcount) < 1) e.headcount = 'Enter valid headcount'
    if (!form.annualPayroll || Number(form.annualPayroll) < 0) e.annualPayroll = 'Enter annual payroll'
    if (isCommercial && !form.annualRevenue) e.annualRevenue = 'Enter annual revenue'
    if (isNGO && !form.annualBudget) e.annualBudget = 'Enter annual budget'
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    
    onComplete({
      orgType: form.orgType,
      headcount: Number(form.headcount),
      annualPayroll: Number(form.annualPayroll),
      annualRevenue: isCommercial ? Number(form.annualRevenue) : 0,
      annualBudget: isNGO ? Number(form.annualBudget) : 0,
      currency: form.currency,
      techMaturity: form.techMaturity,
      countriesOfOperation: Number(form.countriesOfOperation),
      programmeEfficiencyRatio: form.programmeEfficiencyRatio ? Number(form.programmeEfficiencyRatio) / 100 : null,
      costPerBeneficiary: form.costPerBeneficiary ? Number(form.costPerBeneficiary) : null,
    })
  }

  const inputClass = (hasError) => 
    `w-full bg-slate-50 dark:bg-slate-800/50 border ${hasError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0047cc] focus:border-transparent transition-all`

  const orgTypes = selectedSector === 'commercial' ? COMMERCIAL_TYPES : NGO_TYPES

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Organization Selection */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">
              Organization Type
            </h3>
            <p className="text-xs text-slate-500 mb-6">Select your organization type to begin</p>
            
            {/* Sector Toggle */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setSelectedSector('commercial')}
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-all ${selectedSector === 'commercial' 
                  ? 'bg-[#0047cc] text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                Commercial
              </button>
              <button
                onClick={() => setSelectedSector('ngo')}
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-all ${selectedSector === 'ngo' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                Non-Profit / NGO
              </button>
            </div>

            {/* Organization Type Grid */}
            <div className="grid grid-cols-2 gap-3">
              {orgTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => set('orgType', type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    form.orgType === type.id
                      ? 'border-[#0047cc] bg-[#0047cc]/5 text-[#0047cc]'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-tight">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.orgType && <p className="text-xs text-rose-500 mt-2">{errors.orgType}</p>}
          </div>
        </div>

        {/* Right Column: Organization Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">
              Organization Details
            </h3>
            <p className="text-xs text-slate-500 mb-6">Complete your organization profile</p>
            
            {form.orgType && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Total Headcount *
                    </label>
                    <input
                      type="number"
                      min="1"
                      className={inputClass(!!errors.headcount)}
                      placeholder="e.g., 250"
                      value={form.headcount}
                      onChange={e => set('headcount', e.target.value)}
                    />
                    {errors.headcount && <p className="text-xs text-rose-500">{errors.headcount}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Currency
                    </label>
                    <select
                      className={inputClass(false)}
                      value={form.currency}
                      onChange={e => set('currency', e.target.value)}
                    >
                      {CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Annual Payroll ({form.currency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass(!!errors.annualPayroll)}
                    placeholder="e.g., 5000000"
                    value={form.annualPayroll}
                    onChange={e => set('annualPayroll', e.target.value)}
                  />
                  {errors.annualPayroll && <p className="text-xs text-rose-500">{errors.annualPayroll}</p>}
                </div>

                {isCommercial && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Annual Revenue ({form.currency}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={inputClass(!!errors.annualRevenue)}
                      placeholder="e.g., 20000000"
                      value={form.annualRevenue}
                      onChange={e => set('annualRevenue', e.target.value)}
                    />
                    {errors.annualRevenue && <p className="text-xs text-rose-500">{errors.annualRevenue}</p>}
                  </div>
                )}

                {isNGO && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Annual Budget ({form.currency}) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        className={inputClass(!!errors.annualBudget)}
                        placeholder="e.g., 3000000"
                        value={form.annualBudget}
                        onChange={e => set('annualBudget', e.target.value)}
                      />
                      {errors.annualBudget && <p className="text-xs text-rose-500">{errors.annualBudget}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Programme Efficiency (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className={inputClass(false)}
                          placeholder="e.g., 75"
                          value={form.programmeEfficiencyRatio}
                          onChange={e => set('programmeEfficiencyRatio', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Cost per Beneficiary ({form.currency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          className={inputClass(false)}
                          placeholder="e.g., 150"
                          value={form.costPerBeneficiary}
                          onChange={e => set('costPerBeneficiary', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Technology Maturity
                    </label>
                    <select
                      className={inputClass(false)}
                      value={form.techMaturity}
                      onChange={e => set('techMaturity', e.target.value)}
                    >
                      {TECH_MATURITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Countries of Operation
                    </label>
                    <select
                      className={inputClass(false)}
                      value={form.countriesOfOperation}
                      onChange={e => set('countriesOfOperation', e.target.value)}
                    >
                      <option value="1">1 country</option>
                      <option value="3">2–5 countries</option>
                      <option value="6">6+ countries</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.orgType}
            className="w-full py-4 bg-gradient-to-r from-[#0047cc] to-[#0035a0] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:shadow-blue-500/20"
          >
            Calculate My Leakage →
          </button>
        </div>
      </div>
    </div>
  )
}
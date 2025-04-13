import React, { useState, useEffect } from 'react';
import PhoneInput2 from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import styles from './PhoneInput.module.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: string) => void;
  required?: boolean;
  className?: string;
}

// Map of country codes to full names
const countryNames: { [key: string]: string } = {
  il: 'Israel',
  us: 'United States',
  gb: 'United Kingdom',
  ca: 'Canada',
  au: 'Australia',
  // Add more countries as needed
};

const PhoneInput: React.FC<PhoneInputProps> = ({ 
  value, 
  onChange, 
  onCountryChange,
  required, 
  className 
}) => {
  const [country, setCountry] = useState<string>('il');
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    // Try to detect user's country, but allow manual override
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          const detectedCountry = data.country_code.toLowerCase();
          setCountry(detectedCountry);
          // Emit initial country
          onCountryChange?.(countryNames[detectedCountry] || data.country_name);
        }
      })
      .catch(() => {
        // Keep current country if detection fails
        console.log('Country detection failed, using default');
        onCountryChange?.(countryNames['il'] || 'Israel');
      });
  }, [onCountryChange]);

  const handleChange = (value: string, data: any) => {
    setInternalValue(value);
    // Ensure proper formatting with country code
    const formattedNumber = value.startsWith('+') ? value : `+${data.dialCode}${value.replace(/^0+/, '')}`;
    onChange(formattedNumber);
    
    // Emit country change
    const countryCode = data.countryCode.toLowerCase();
    onCountryChange?.(countryNames[countryCode] || data.name || countryCode);
  };

  return (
    <div className={`${styles.phoneInputWrapper} ${className || ''}`}>
      <PhoneInput2
        country={country}
        value={internalValue}
        onChange={handleChange}
        inputProps={{
          required,
          className: 'w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2'
        }}
        buttonClass="bg-gray-700 border border-gray-600 rounded-l-lg"
        dropdownClass="bg-gray-700 border border-gray-600"
        searchClass="bg-gray-700 border border-gray-600"
        containerClass="w-full"
        enableSearch={true}
        disableSearchIcon={false}
        searchPlaceholder="Search country..."
        searchNotFound="No country found"
        preferredCountries={['il', 'us', 'gb', 'ca', 'au']}
        enableAreaCodes={false}
        enableLongNumbers={true}
        disableDropdown={false}
        countryCodeEditable={false}
        inputStyle={{
          paddingLeft: '88px'
        }}
        specialLabel=""
        enableAreaCodeStretch={false}
        placeholder=""
      />
    </div>
  );
};

export default PhoneInput; 
import * as React from "react"
import { Input } from "./input"
import { Select } from "./select"

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    countryCode?: string
    onCountryCodeChange?: (code: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, countryCode = '+91', onCountryCodeChange, ...props }, ref) => {
        return (
            <div className="flex space-x-2">
                <div className="w-24">
                    <Select
                        value={countryCode}
                        onChange={(e) => onCountryCodeChange?.(e.target.value)}
                        disabled
                    >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                    </Select>
                </div>
                <Input
                    type="tel"
                    placeholder="Phone Number"
                    className="flex-1"
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }

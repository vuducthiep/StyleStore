import { MapPin } from "lucide-react";

interface Province {
    Id: string;
    Name: string;
    Districts: District[];
}

interface District {
    Id: string;
    Name: string;
    Wards: Ward[];
}

interface Ward {
    Id: string;
    Name: string;
    Level?: string;
}

interface AddressSectionProps {
    addressType: 'home' | 'custom';
    onAddressTypeChange: (type: 'home' | 'custom') => void;
    userHomeAddress: string | undefined;
    selectedProvince: string;
    onProvinceChange: (provinceId: string) => void;
    selectedDistrict: string;
    onDistrictChange: (districtId: string) => void;
    selectedWard: string;
    onWardChange: (wardId: string) => void;
    detailedAddress: string;
    onDetailedAddressChange: (address: string) => void;
    provinces: Province[];
    districts: District[];
    wards: Ward[];
    selectedAddress: string;
}

export default function AddressSection({
    addressType,
    onAddressTypeChange,
    userHomeAddress,
    selectedProvince,
    onProvinceChange,
    selectedDistrict,
    onDistrictChange,
    selectedWard,
    onWardChange,
    detailedAddress,
    onDetailedAddressChange,
    provinces,
    districts,
    wards,
    selectedAddress,
}: AddressSectionProps) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                    <MapPin size={24} />
                    <h3 className="text-lg font-bold">Địa chỉ giao hàng</h3>
                </div>
            </div>

            <div className="p-6">
                {/* Address Type Selection */}
                <div className="mb-6 space-y-3">
                    {/* Option 1: Home Address */}
                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50" style={{ borderColor: addressType === 'home' ? '#2563eb' : '#e5e7eb' }}>
                        <input
                            type="radio"
                            name="addressType"
                            value="home"
                            checked={addressType === 'home'}
                            onChange={() => onAddressTypeChange('home')}
                            className="mt-1 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">Địa chỉ nhà riêng</p>
                            <p className="text-sm text-gray-600">{userHomeAddress || "Chưa cập nhật"}</p>
                        </div>
                    </label>

                    {/* Option 2: Custom Address */}
                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50" style={{ borderColor: addressType === 'custom' ? '#2563eb' : '#e5e7eb' }}>
                        <input
                            type="radio"
                            name="addressType"
                            value="custom"
                            checked={addressType === 'custom'}
                            onChange={() => onAddressTypeChange('custom')}
                            className="mt-1 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-3">Địa chỉ tự chọn</p>

                            {/* Address Selection Dropdowns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                {/* Province */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Tỉnh/Thành phố
                                    </label>
                                    <select
                                        value={selectedProvince}
                                        onChange={(e) => onProvinceChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        <option value="">Chọn tỉnh/thành phố</option>
                                        {provinces.map((province) => (
                                            <option key={province.Id} value={province.Id}>
                                                {province.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* District */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Quận/Huyện
                                    </label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => onDistrictChange(e.target.value)}
                                        disabled={!selectedProvince}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map((district) => (
                                            <option key={district.Id} value={district.Id}>
                                                {district.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ward */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Phường/Xã
                                    </label>
                                    <select
                                        value={selectedWard}
                                        onChange={(e) => onWardChange(e.target.value)}
                                        disabled={!selectedDistrict}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Chọn phường/xã</option>
                                        {wards.map((ward) => (
                                            <option key={ward.Id} value={ward.Id}>
                                                {ward.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Detailed Address */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Số nhà, đường, v.v.
                                </label>
                                <input
                                    type="text"
                                    value={detailedAddress}
                                    onChange={(e) => onDetailedAddressChange(e.target.value)}
                                    placeholder="Nhập số nhà, tên đường..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    </label>
                </div>

                {/* Selected Address Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-gray-600 mb-1">Địa chỉ giao hàng:</p>
                    <p className="text-gray-900 font-semibold">{selectedAddress}</p>
                </div>
            </div>
        </div>
    );
}

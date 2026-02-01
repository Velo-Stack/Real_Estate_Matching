import { useMeta, useNeighborhoods } from '../../hooks';
import { inputClasses, labelClasses } from '../../constants/styles';

// Fallback data (في حالة فشل الـ API)
const FALLBACK_CITIES = [
    { id: 1, name: 'الرياض' },
    { id: 2, name: 'جدة' },
    { id: 3, name: 'مكة المكرمة' },
    { id: 4, name: 'المدينة المنورة' },
    { id: 5, name: 'الدمام' },
];

const CityDistrictSelect = ({
    cityValue,
    districtValue,
    onCityChange,
    onDistrictChange,
    cityName = 'city',
    districtName = 'district',
    // لدعم الـ ID based selection
    useCityId = false,
    required = false,
}) => {
    // جلب المدن من الـ API
    const { cities, citiesLoading, cityOptions } = useMeta();

    // جلب الأحياء بناءً على المدينة
    const cityId = useCityId ? cityValue : cities.find(c => c.name === cityValue)?.id;
    const { neighborhoods, isLoading: neighborhoodsLoading, neighborhoodOptions } = useNeighborhoods(cityId);

    // استخدام fallback لو الـ API فشل
    const displayCities = cities.length > 0 ? cities : FALLBACK_CITIES;

    // مسح الحي عند تغيير المدينة
    const handleCityChange = (e) => {
        onCityChange(e);
        if (onDistrictChange) {
            const fakeEvent = { target: { name: districtName, value: '' } };
            onDistrictChange(fakeEvent);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className={labelClasses}>المدينة</label>
                <select
                    name={cityName}
                    className={inputClasses}
                    value={cityValue}
                    onChange={handleCityChange}
                    required={required}
                    disabled={citiesLoading}
                >
                    <option value="">{citiesLoading ? 'جاري التحميل...' : 'اختر المدينة'}</option>
                    {useCityId
                        ? cityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                        : displayCities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)
                    }
                </select>
            </div>
            <div>
                <label className={labelClasses}>الحي</label>
                {useCityId && cityId ? (
                    // استخدام dropdown من الـ API
                    <select
                        name={districtName}
                        className={inputClasses}
                        value={districtValue}
                        onChange={onDistrictChange}
                        required={required}
                        disabled={!cityValue || neighborhoodsLoading}
                    >
                        <option value="">{neighborhoodsLoading ? 'جاري التحميل...' : 'اختر الحي'}</option>
                        {neighborhoodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                ) : (
                    // استخدام input نصي
                    <input
                        name={districtName}
                        className={inputClasses}
                        value={districtValue}
                        onChange={onDistrictChange}
                        placeholder="أدخل الحي"
                        required={required}
                        disabled={!cityValue}
                    />
                )}
            </div>
        </div>
    );
};

export default CityDistrictSelect;

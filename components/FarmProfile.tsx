
import React, { useState, useRef, useEffect } from 'react';
import { User, MapPin, Ruler, Save, Leaf, CheckCircle2, Camera, Upload, Loader2, Droplets } from 'lucide-react';
import { UserProfile, CropType } from '../types';
import { resizeImage } from '../utils/sharedUtils';

interface FarmProfileProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const FarmProfile: React.FC<FarmProfileProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync prop changes to state (essential when login updates profile)
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleCrop = (crop: string) => {
    setFormData(prev => {
      const crops = prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop];
      return { ...prev, crops };
    });
    setSaved(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const file = e.target.files[0];
        const resizedBase64 = await resizeImage(file, 200, 0.8);
        setFormData(prev => ({ ...prev, profileImage: resizedBase64 }));
        setSaved(false);
      } catch (error) {
        console.error("Image processing failed", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col bg-transparent pb-32 md:pb-10">
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-6 py-4 md:py-6 shadow-sm border-b border-white/40 dark:border-white/5 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-white flex items-center">
              <User className="mr-3 text-emerald-600" /> Farm Profile
            </h2>
            <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-1">Manage details for AI insights.</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Profile Picture & Personal Info Card */}
          <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-lg border border-white/50 dark:border-stone-700">
             <h3 className="font-bold text-lg text-stone-800 dark:text-white mb-6 border-b border-stone-100 dark:border-stone-700 pb-2">Identity</h3>
             
             <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
                <div className="flex flex-col items-center gap-4 mx-auto md:mx-0">
                    <div 
                        className="relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-stone-100 dark:bg-stone-700 border-4 border-white dark:border-stone-600 shadow-xl cursor-pointer group overflow-hidden transition-transform hover:scale-105"
                        onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                        {uploading ? (
                             <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800">
                                 <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                             </div>
                        ) : formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-500">
                                <User className="w-12 h-12 md:w-16 md:h-16" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <button 
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center disabled:opacity-50 uppercase tracking-wide bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full"
                    >
                        <Upload className="w-3 h-3 mr-1.5" /> {uploading ? 'Processing...' : 'Upload Photo'}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                <div className="flex-1 grid grid-cols-1 gap-6 w-full">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2 tracking-wide">Farmer Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-4 h-5 w-5 text-stone-400" />
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 border border-stone-200 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white"
                                placeholder="Enter your name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2 tracking-wide">Location (County/Town)</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-stone-400" />
                            <input 
                                type="text" 
                                value={formData.location}
                                onChange={e => handleChange('location', e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 border border-stone-200 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white"
                                placeholder="e.g. Nairobi"
                            />
                        </div>
                        <p className="text-xs text-stone-400 mt-2 ml-1">Used for weather and market prices.</p>
                    </div>
                </div>
             </div>
          </div>

          {/* Farm Details Card */}
          <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-lg border border-white/50 dark:border-stone-700">
             <h3 className="font-bold text-lg text-stone-800 dark:text-white mb-6 border-b border-stone-100 dark:border-stone-700 pb-2">Farm Specifics</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2 tracking-wide">Farm Size</label>
                   <div className="relative">
                      <Ruler className="absolute left-4 top-4 h-5 w-5 text-stone-400" />
                      <input 
                        type="text" 
                        value={formData.farmSize}
                        onChange={e => handleChange('farmSize', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-stone-200 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white"
                        placeholder="e.g. 2 Acres"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2 tracking-wide">Soil Type</label>
                   <div className="relative">
                      <Leaf className="absolute left-4 top-4 h-5 w-5 text-stone-400" />
                      <select 
                        value={formData.soilType}
                        onChange={e => handleChange('soilType', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-stone-200 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white transition-all appearance-none"
                      >
                         <option>Loam</option>
                         <option>Clay</option>
                         <option>Sandy</option>
                         <option>Silt</option>
                         <option>Black Cotton</option>
                      </select>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2 tracking-wide">Water Source</label>
                   <div className="relative">
                      <Droplets className="absolute left-4 top-4 h-5 w-5 text-stone-400" />
                      <select 
                        value={formData.waterSource || 'Rain-fed'}
                        onChange={e => handleChange('waterSource', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-stone-200 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white transition-all appearance-none"
                      >
                         <option>Rain-fed</option>
                         <option>Irrigation (Drip)</option>
                         <option>Irrigation (Furrow)</option>
                         <option>Borehole</option>
                         <option>River</option>
                      </select>
                   </div>
                </div>
             </div>
          </div>

          {/* Crops Selection */}
          <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-lg border border-white/50 dark:border-stone-700">
             <h3 className="font-bold text-lg text-stone-800 dark:text-white mb-4 border-b border-stone-100 dark:border-stone-700 pb-2">Crops Grown</h3>
             <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Select the crops you currently grow to receive targeted alerts.</p>
             <div className="flex flex-wrap gap-3">
                {Object.values(CropType).map(crop => (
                   <button
                     key={crop}
                     type="button"
                     onClick={() => toggleCrop(crop)}
                     className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all flex items-center ${
                       formData.crops.includes(crop)
                         ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500'
                         : 'bg-stone-50 dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-300 hover:border-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                     }`}
                   >
                      {formData.crops.includes(crop) && <CheckCircle2 className="w-4 h-4 mr-2" />}
                      {crop}
                   </button>
                ))}
             </div>
          </div>

          <div className="sticky bottom-24 md:bottom-4 z-10">
             <button 
               type="submit"
               className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center transition-all ${
                 saved 
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
               }`}
             >
                {saved ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 mr-2" /> Profile Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 mr-2" /> Save Changes
                  </>
                )}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default FarmProfile;

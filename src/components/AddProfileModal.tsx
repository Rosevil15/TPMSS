import {IonModal,IonContent,IonHeader,IonToolbar,IonTitle,IonButton,IonCard,IonCardContent,IonItem,IonLabel,IonInput,IonSelect,IonSelectOption,IonCardHeader,IonCardTitle,useIonActionSheet,IonRow,IonCol,IonGrid,IonItemGroup,IonItemDivider,IonCheckbox,IonRadio,IonRadioGroup,IonSpinner} from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabaseClients';
import {saveCompleteProfile} from '../services/profileService';
import { regions, provinces, city_mun, barangays } from 'phil-reg-prov-mun-brgy';
import { contract } from 'ionicons/icons';
import { Row } from 'jspdf-autotable';

interface AddProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (profile: any) => Promise<void>;
    editingProfile?: any;
    isEditing?: boolean;
}

interface ValidationErrors {
    [key: string]: boolean;
}

interface RequiredFields {
  profile: string[];
  partner: string[];
}

const AddProfileModal: React.FC<AddProfileModalProps> = ({ isOpen, onClose, onSave, editingProfile = null, isEditing: isEditingProp = false }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [isIndigenous, setIsIndigenous] = useState<string>(''); 
   const [isPartnerIndigenous, setIsPartnerIndigenous] = useState<string>('');
   const [isMultiplePartners, setIsMultiplePartners] = useState<string>('');
   const [motherInfoComplete, setMotherInfoComplete] = useState(false);
   const [fatherInfoComplete, setFatherInfoComplete] = useState(false);

   const [profileData, setProfileData] = useState<any>({
        firstName: '',  
        lastName: '',   
        age: 0,
        birthdate: '',
        contactnum: '',
        barangay: '',
        municipality: '',
        province: '',
        region: '',
        zipcode: '',
        marital_status: '',
        religion: '',
        living_with: '',
        current_year_level: '',
        highest_educational_attainment: '',
        fathers_occupation: '',
        mothers_occupation: '',
        indigenous_ethnicity: '',
        mothers_income: '',
        fathers_income: '',
        teenage_income: '',
        teenage_occupation: '',
        type_of_school: '',
        multiple_partner_num: 0,
   });

   const [partnersData, setPartnersData] = useState<any>({
      pFirstname: '',
      pLastname: '',
      pAge: 0,
      pBirthdate: '',
      pOccupation: '',
      pIncome: '',
      contract_num: '',
      region: '',
      province: '',
      municipality: '',
      barangay: '',
      zipcode: '',
      marital_status: '',
      living_with: '',
      current_year_level: '',
      highest_educational_attainment: '',
      religion: '',
      fathers_occupation: '',
      mothers_occupation: '',
      fathers_income: '',
      mothers_income: '',
      indigenous_ethnicity: '',
      type_of_school: '',
    });

    const [partnersProvincelist, setPartnersProvincelist] = useState<any[]>([]);
    const [partnersMunicipalitylist, setPartnersMunicipalitylist] = useState<any[]>([]);
    const [partnersBarangaylist, setPartnersBarangaylist] = useState<any[]>([]);


  useEffect(() => {
       if (isOpen && editingProfile && isEditingProp) {
           setIsEditing(true);
           loadEditingData(editingProfile.profileid);
       } else if (isOpen && !isEditingProp) {
           setIsEditing(false);
           resetForm();
       }
   }, [isOpen, editingProfile, isEditingProp]);

   // Update the loadEditingData function (around line 82):
  const loadEditingData = async (profileId: number) => {
      try {
          setLoading(true);
          
          // Fetch profile data
          const { data: profile, error: profileError } = await supabase
              .from('profile')
              .select('*')
              .eq('profileid', profileId)
              .single();
          
          if (profileError) throw profileError;
          
          // Fetch partner data
          const { data: partner, error: partnerError } = await supabase
              .from('partnersInfo')
              .select('*')
              .eq('profileid', profileId)
              .maybeSingle();
          
          if (partnerError) throw partnerError;

          // Set profile data
          if (profile) {
              setProfileData({
                  firstName: profile.firstName || '',
                  lastName: profile.lastName || '',
                  age: profile.age || 0,
                  birthdate: profile.birthdate || '',
                  contactnum: profile.contactnum || '',
                  barangay: profile.barangay || '',
                  municipality: profile.municipality || '',
                  province: profile.province || '',
                  region: profile.region || '',
                  zipcode: profile.zipcode || '',
                  marital_status: profile.marital_status || '',
                  religion: profile.religion || '',
                  living_with: profile.living_with || '',
                  current_year_level: profile.current_year_level || '',
                  highest_educational_attainment: profile.highest_educational_attainment || '',
                  fathers_occupation: profile.fathers_occupation || '',
                  mothers_occupation: profile.mothers_occupation || '',
                  indigenous_ethnicity: profile.indigenous_ethnicity || '',
                  mothers_income: profile.mothers_income || '',
                  fathers_income: profile.fathers_income || '',
                  teenage_income: profile.teenage_income || '',
                  teenage_occupation: profile.teenage_occupation || '',
                  type_of_school: profile.type_of_school || '',
                  multiple_partner_num: profile.multiple_partner_num || 0,
              });
              
              
              setIsIndigenous(profile.indigenous_ethnicity ? 'Yes' : 'No');
               setIsMultiplePartners(profile.multiple_partner_num ? 'Yes' : 'No');
              // Set location dropdowns
              if (profile.region) {
                //console.log('Finding region:', profile.region);
                const region = regions.find((r: any) => r.name === profile.region);
                //console.log('Found region:', region);
                
                if (region) {
                    const filteredProvinces = provinces.filter((prov: { reg_code: string }) => prov.reg_code === region.reg_code);
                    
                    setProvincelist(filteredProvinces);
                    
                    if (profile.province) {
                        
                        const province = filteredProvinces.find((p: any) => p.name === profile.province);

                        if (province) {
                            const filteredMunicipalities = city_mun.filter((mun: { prov_code: string }) => mun.prov_code === province.prov_code);
                           
                            setMunicipalitylist(filteredMunicipalities);
                            
                            if (profile.municipality) {
                                const municipality = filteredMunicipalities.find((m: any) => m.name === profile.municipality);
                                
                                if (municipality) {
                                    const filteredBarangays = barangays.filter((brgy: { mun_code: string }) => brgy.mun_code === municipality.mun_code);
                                    let foundBarangay = filteredBarangays.find((b: any) => b.name === profile.barangay);  
                                    
                                    if (!foundBarangay) { 
                                        foundBarangay = filteredBarangays.find((b: any) => b.name.toLowerCase() === profile.barangay.toLowerCase());
                                    }
                                    
                                    if (!foundBarangay) {  
                                        foundBarangay = filteredBarangays.find((b: any) => b.name.trim() === profile.barangay.trim());
                                    }                     
                                    setBarangaylist(filteredBarangays);
                                } 
                            }
                        } 
                    }
                } 
                
            }
          }
          
          // Set partner data
          if (partner) {
              setPartnersData({
                  pFirstname: partner.pFirstname || '',
                  pLastname: partner.pLastname || '',
                  pAge: partner.pAge || 0,
                  pBirthdate: partner.pBirthdate || '',
                  pOccupation: partner.pOccupation || '',
                  pIncome: partner.pIncome || '',
                  contact_num: partner.contact_num || '',
                  living_with: partner.living_with || '',
                  marital_status: partner.marital_status || '',
                  region: partner.region || '',
                  province: partner.province || '',
                  municipality: partner.municipality || '',
                  barangay: partner.barangay || '',
                  zipcode: partner.zipcode || '',
                  current_year_level: partner.current_year_level || '',
                  highest_educational_attainment: partner.highest_educational_attainment || '',
                  religion: partner.religion || '',
                  fathers_occupation: partner.fathers_occupation || '',
                  mothers_occupation: partner.mothers_occupation || '',
                  fathers_income: partner.fathers_income || '',
                  mothers_income: partner.mothers_income || '',
                  indigenous_ethnicity: partner.indigenous_ethnicity || '',
                  type_of_school: partner.type_of_school || 0,
              });

              setIsPartnerIndigenous(partner.indigenous_ethnicity ? 'Yes' : 'No');

              if (partner.region) {
                const region = regions.find((r: any) => r.name === partner.region);

                if (region) {
                  const filteredProvinces = provinces.filter((prov: { reg_code: string }) => prov.reg_code === region.reg_code);
                  setPartnersProvincelist(filteredProvinces);
                
                  if (partner.province) {
                    const province = provinces.find((p: any) => p.name === partner.province);

                    if (province) {
                      const filteredMunicipalities = city_mun.filter((mun: { prov_code: string }) => mun.prov_code === province.prov_code);
                      setPartnersMunicipalitylist(filteredMunicipalities);

                      if (partner.municipality) {
                        const municipality = filteredMunicipalities.find((m: any) => m.name === partner.municipality);

                        if (municipality) {
                          const filteredBarangays = barangays.filter((brgy: { mun_code: string }) => brgy.mun_code === municipality.mun_code);
                          setPartnersBarangaylist(filteredBarangays);
                          let foundBarangay = filteredBarangays.find((b: any) => b.name === partner.barangay);
                          
                          if (!foundBarangay) {
                            foundBarangay = filteredBarangays.find((b: any) => b.name === partner.barangay);
                          }
                          if (!foundBarangay) {
                            foundBarangay = filteredBarangays.find((b: any) => b.name.toLowerCase() === partner.barangay.toLowerCase());
                            setPartnersBarangaylist(filteredBarangays);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
      } catch (err: any) {
          console.error('Error loading profile for editing:', err);
          setError(err.message || 'Failed to load profile data');
      } finally {
          setLoading(false);
      }
  };

   const resetForm = () => {
       setProfileData({
          firstName: '',
          lastName: '',
          age: 0,
          birthdate: '',
          contactnum: '',
          barangay: '',
          municipality: '',
          province: '',
          region: '',
          zipcode: '',
          marital_status: '',
          religion: '',
          living_with: '',
          current_year_level: '',
          highest_educational_attainment: '',
          fathers_occupation: '',
          mothers_occupation: '',
          indigenous_ethnicity: '',
          mothers_income: '',
          fathers_income: '',
          teenage_income: '',
          teenage_occupation: '',
          type_of_school: '',
          multiple_partner_num: 0,
       });

       setPartnersData({
          pFirstname: '',
          pLastname: '',
          pAge: 0,
          pBirthdate: '',
          pOccupation: '',
          pIncome: '',
          contact_num: '',
          living_with: '',
          marital_status: '',
          region: '',
          province: '',
          municipality: '',
          barangay: '',
          zipcode: '',
          current_year_level: '',
          highest_educational_attainment: '',
          religion: '',
          fathers_occupation: '',
          mothers_occupation: '',
          fathers_income: '',
          mothers_income: '',
          type_of_school: '',
          
          
       });
       
      setProvincelist([]);
      setMunicipalitylist([]);
      setBarangaylist([]);

      setPartnersProvincelist([]);
      setPartnersMunicipalitylist([]);
      setPartnersBarangaylist([]);
   
      setIsIndigenous('');
      setIsPartnerIndigenous('');
      setIsMultiplePartners('');
      setError(null);
   };
   
  // Save mother info handler
const handleSaveMotherInfo = async () => {
  try {
    setIsValidating(true);
    setError(null);

    // Validate only mother's required fields
    const motherErrors: ValidationErrors = {};
    let firstErrorField: string | null = null;

    requiredFields.profile.forEach(field => {
      const isValid = validateFields(field, profileData[field], 'profile');
      if (!isValid) {
        motherErrors[field] = true;
        if (!firstErrorField) { firstErrorField = field; }
      }
    });

    setValidationError(motherErrors);
    
    if (Object.keys(motherErrors).length > 0) {
      setError('Please fill up all required fields for Teenage Mother Information.');
      if (firstErrorField) {
        setTimeout(() => scrollField(firstErrorField!), 100);
      }
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    let profileId: number;

    if (isEditing && editingProfile) {
      profileId = editingProfile.profileid;
    } else {
      const currentYear = new Date().getFullYear();
      const yearPrefix = parseInt(currentYear.toString());

      const { data: latestProfile, error: fetchError } = await supabase
        .from('profile')
        .select('profileid')
        .gte('profileid', yearPrefix * 10000)
        .lt('profileid', (yearPrefix + 1) * 10000)
        .order('profileid', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (latestProfile && latestProfile.profileid) {
        profileId = latestProfile.profileid + 1;
      } else {
        profileId = yearPrefix * 10000 + 1;
      }
    }

    const formatDateForDB = (dateString: string) => {
      return dateString && dateString.trim() !== '' ? dateString : null;
    };

    const profilePayload = {
      profileid: profileId,
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      age: profileData.age || 0,
      birthdate: formatDateForDB(profileData.birthdate),
      contactnum: profileData.contactnum || '',
      barangay: profileData.barangay || '',
      municipality: profileData.municipality || '',
      province: profileData.province || '',
      region: profileData.region || '',
      zipcode: profileData.zipcode || '',
      marital_status: profileData.marital_status || '',
      religion: profileData.religion || '',
      living_with: profileData.living_with || '',
      current_year_level: profileData.current_year_level || '',
      highest_educational_attainment: profileData.highest_educational_attainment || '',
      fathers_occupation: profileData.fathers_occupation || '',
      mothers_occupation: profileData.mothers_occupation || '',
      indigenous_ethnicity: profileData.indigenous_ethnicity || '',
      teenage_income: profileData.teenage_income || '',
      teenage_occupation: profileData.teenage_occupation || '',
      mothers_income: profileData.mothers_income || '',
      fathers_income: profileData.fathers_income || '',
      type_of_school: profileData.type_of_school || '',
      multiple_partner_num: profileData.multiple_partner_num || 0,
    };

    if (isEditing) {
      const { error: profileError } = await supabase
        .from('profile')
        .update(profilePayload)
        .eq('profileid', profileId);
      if (profileError) throw profileError;
    } else {
      const { error: profileError } = await supabase
        .from('profile')
        .insert(profilePayload);
      if (profileError) throw profileError;
    }

    setMotherInfoComplete(true);
    setError('Teenage Mother Information saved successfully!');
    setTimeout(() => setError(null), 3000);

  } catch (err: any) {
    console.error('Error saving mother info:', err);
    setError(err.message || 'An error occurred while saving mother information');
  } finally {
    setLoading(false);
    setIsValidating(false);
  }
};

const handleSaveFatherInfo = async () => {
  try {
    setIsValidating(true);
    setError(null);

    if (!motherInfoComplete && !isEditing) {
      setError('Please save Teenage Mother Information first.');
      return;
    }

    // Validate only father's required fields
    const fatherErrors: ValidationErrors = {};
    let firstErrorField: string | null = null;

    requiredFields.partner.forEach(field => {
      const isValid = validateFields(field, partnersData[field], 'partner');
      if (!isValid) {
        fatherErrors[field] = true;
        if (!firstErrorField) { firstErrorField = field; }
      }
    });

    setValidationError(fatherErrors);
    
    if (Object.keys(fatherErrors).length > 0) {
      setError('Please fill up all required fields for Teenage Father Information.');
      if (firstErrorField) {
        setTimeout(() => scrollField(firstErrorField!), 100);
      }
      return;
    }

    setLoading(true);

    let profileId: number;
    if (isEditing && editingProfile) {
      profileId = editingProfile.profileid;
    } else {
      // Get the profile ID from the just-saved profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { data: savedProfile, error: fetchError } = await supabase
        .from('profile')
        .select('profileid')
        .eq('firstName', profileData.firstName)
        .eq('lastName', profileData.lastName)
        .eq('birthdate', profileData.birthdate)
        .order('profileid', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !savedProfile) {
        throw new Error('Could not find saved profile. Please save Teenage Mother Information first.');
      }

      profileId = savedProfile.profileid;
    }

    const formatDateForDB = (dateString: string) => {
      return dateString && dateString.trim() !== '' ? dateString : null;
    };

    const partnersPayload = {
      partnerid: profileId,
      profileid: profileId,
      pFirstname: partnersData.pFirstname || '',
      pLastname: partnersData.pLastname || '',
      pAge: partnersData.pAge || 0,
      pBirthdate: formatDateForDB(partnersData.pBirthdate),
      pOccupation: partnersData.pOccupation || '',
      pIncome: partnersData.pIncome || '',
      contact_num: partnersData.contact_num || '',
      region: partnersData.region || '',
      province: partnersData.province || '',
      municipality: partnersData.municipality || '',
      barangay: partnersData.barangay || '',
      zipcode: partnersData.zipcode || '',
      marital_status: partnersData.marital_status || '',
      living_with: partnersData.living_with || '',
      current_year_level: partnersData.current_year_level || '',
      highest_educational_attainment: partnersData.highest_educational_attainment || '',
      religion: partnersData.religion || '',
      fathers_occupation: partnersData.fathers_occupation || '',
      mothers_occupation: partnersData.mothers_occupation || '',
      fathers_income: partnersData.fathers_income || '',
      mothers_income: partnersData.mothers_income || '',
      indigenous_ethnicity: partnersData.indigenous_ethnicity || '',
      type_of_school: partnersData.type_of_school || '',
    };

    const { data: existingPartner } = await supabase
      .from('partnersInfo')
      .select('partnerid')
      .eq('profileid', profileId)
      .maybeSingle();

    if (existingPartner) {
      const { error: partnerError } = await supabase
        .from('partnersInfo')
        .update(partnersPayload)
        .eq('profileid', profileId);
      if (partnerError) throw partnerError;
    } else {
      const { error: partnerError } = await supabase
        .from('partnersInfo')
        .insert(partnersPayload);
      if (partnerError) throw partnerError;
    }

    setFatherInfoComplete(true);
    await onSave({ profileid: profileId });
    resetForm();
    onClose();

  } catch (err: any) {
    console.error('Error saving father info:', err);
    setError(err.message || 'An error occurred while saving father information');
  } finally {
    setLoading(false);
    setIsValidating(false);
  }
};

  const handleChange = (field: string, value: string | number | boolean) => {
    // Map field names
    const fieldNameMapping: Record<string, string> = {
      firstName: "firstName", 
      lastName: "lastName",
      
      pMarital_status: "marital_status",
      pReligion: "religion",
      pLiving_with: "living_with",
      pCurrent_year_level: "current_year_level",
      pHighest_educational_attainment: "highest_educational_attainment",
      pType_of_school: "type_of_school",
      pIndigenous_ethnicity: "indigenous_ethnicity",
      pRegion: "region",
      pProvince: "province",
      pMothers_occupation: "mothers_occupation",
      pFathers_occupation: "fathers_occupation",
      pMothers_income: "mothers_income",
      pFathers_income: "fathers_income",
      pMunicipality: "municipality",
      pBarangay: "barangay",
      pZipcode: "zipcode"
    };

    // Partner data fields 
    if (field.startsWith('p') || field === "contact_num") {
      setPartnersData((prevData: any) => ({
        ...prevData,
        [fieldNameMapping[field] || field]: field === "pAge" ? Number(value) : value
      }));
    }
    // Profile data fields 
    else {
        setProfileData((prevData: any) => ({
          ...prevData,
          [fieldNameMapping[field] || field]: field === "age" ? Number(value) : value
        }));
    }
};

  const [regionlist, setRegionlist] = useState<any[]>(regions);
  const [provincelist, setProvincelist] = useState<any[]>([]);
  const [municipalitylist, setMunicipalitylist] = useState<any[]>([]);
  const [barangaylist, setBarangaylist] = useState<any[]>([]);

const handleRegionChange = (regionCode: string) => {
  const filteredProvinces = provinces
    .filter((prov: { reg_code: string }) => prov.reg_code === regionCode);
  
  // Clear dependent fields in profileData immediately
  setProfileData((prev: any) => ({
    ...prev,
    province: '',
    municipality: '',
    barangay: ''
  }));
  
  // Update location states
  setProvincelist(filteredProvinces);
  setMunicipalitylist([]);
  setBarangaylist([]);

  const selectedRegion = regionlist.find((r: any) => r.reg_code === regionCode);
  setProfileData((prev: any) => ({
    ...prev,
    region: selectedRegion?.name || regionCode
  }));
};

const handleProvinceChange = (provinceCode: string) => {
  const filteredMunicipalities = city_mun
    .filter((mun: { prov_code: string }) => mun.prov_code === provinceCode);
  
  // Clear dependent fields in profileData immediately
  setProfileData((prev: any) => ({
    ...prev,
    municipality: '',
    barangay: ''
  }));
  
  // Update location states
  setMunicipalitylist(filteredMunicipalities);
  setBarangaylist([]);

  const selectedProvince = provincelist.find((p: any) => p.prov_code === provinceCode);
  setProfileData((prev: any) => ({
    ...prev,
    province: selectedProvince?.name || provinceCode
  }));
};

const handleMunicipalityChange = (municipalityCode: string) => {
  const filteredBarangays = barangays
    .filter((brgy: { mun_code: string }) => brgy.mun_code === municipalityCode);
  
  // Clear dependent fields in profileData immediately
  setProfileData((prev: any) => ({
    ...prev,
    barangay: ''
  }));
  
  // Update location states
  setBarangaylist(filteredBarangays);

  const selectedMunicipality = municipalitylist.find((m: any) => m.mun_code === municipalityCode);
  setProfileData((prev: any) => ({
    ...prev,
    municipality: selectedMunicipality?.name || municipalityCode
  }));
};


// Partner address handlers
  const handlePartnerRegionChange = (regionCode: string) => {
    const filteredProvinces = provinces
      .filter((prov: { reg_code: string }) => prov.reg_code === regionCode);
      setPartnersProvincelist(filteredProvinces);
      setPartnersMunicipalitylist([]);
      setPartnersBarangaylist([]);

    const selectedRegion = regionlist.find((r: any) => r.reg_code === regionCode);
    handleChange("pRegion", selectedRegion?.name || regionCode);
  };

  const handlePartnerProvinceChange = (provinceCode: string) => {
    const filteredMunicipalities = city_mun
      .filter((mun: { prov_code: string }) => mun.prov_code === provinceCode);
      setPartnersMunicipalitylist(filteredMunicipalities);
      setPartnersBarangaylist([]);

    const selectedProvince = partnersProvincelist.find((p: any) => p.prov_code === provinceCode);
      handleChange("pProvince", selectedProvince?.name || provinceCode);
  };

  const handlePartnerMunicipalityChange = (municipalityCode: string) => {
    const filteredBarangays = barangays
      .filter((brgy: { mun_code: string }) => brgy.mun_code === municipalityCode);
    setPartnersBarangaylist(filteredBarangays);

    const selectedMunicipality = partnersMunicipalitylist.find((m: any) => m.mun_code === municipalityCode);
    handleChange("pMunicipality", selectedMunicipality?.name || municipalityCode);
  };

  const [validationError, setValidationError] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  

  const requiredFields: RequiredFields = {
    profile: [ 'firstName', 'lastName', 'birthdate', 'contactnum', 'region', 'province', 'municipality', 'barangay', 'zipcode', 'marital_status', 'religion', 'living_with', 'current_year_level', 'highest_educational_attainment', 'fathers_occupation', 'mothers_occupation', 'fathers_income', 'mothers_income', 'type_of_school' ],
    partner: [  'pFirstname', 'pLastname', 'pAge', 'pBirthdate']
  };

  const fieldRefs = useRef<{ [key: string]: HTMLIonInputElement | HTMLIonSelectElement | null}>({});
  const containerRef = useRef<HTMLIonContentElement>(null);

  const validateFields = (fieldName: string, value: any, fieldType: 'profile' | 'partner'): boolean => {
    if (!requiredFields[fieldType].includes (fieldName)) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim() !== '';
    }

    if (typeof value === 'number') {
      return value > 0;
    }

    return value !== null && value !== '' && value !== undefined;
  };

  const validateAllFields = (): {isValid: boolean; firstErrorField: string | null} => {
    const errors: ValidationErrors = {};
    let firstErrorField: string | null = null;

    requiredFields.profile.forEach(field => {
      const isValid = validateFields(field, profileData[field],'profile');
      if (!isValid) {
        errors[field] = true;
        if(!firstErrorField) {firstErrorField = field};
      }
    });

    requiredFields.partner.forEach(field => {
      const isValid = validateFields(field, partnersData[field], 'partner');
      if (!isValid) {
        errors[field] = true;
        if(!firstErrorField) {firstErrorField = field};
      }
    });

    setValidationError(errors);
    return { isValid: Object.keys(errors).length === 0, firstErrorField };
  };
  const clearFieldError = (fieldName: string) => {
    if (validationError[fieldName]) {
      setValidationError(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };
  
  const scrollField = (fieldName: string) => {
    const fieldRef = fieldRefs.current[fieldName];

    if (fieldRef && containerRef.current) {
      const fieldElement = fieldRef.closest('.ion-margin') || fieldRef;

      if (fieldElement) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const fieldRect = fieldElement.getBoundingClientRect();

        const offset = fieldRect.top - containerRect.top + container.scrollTop ;
        
        container.scrollToPoint(0, offset - 100, 500); 

        setTimeout(() => {
          if (fieldRef.focus) {
            fieldRef.focus();
          }
        } , 600);
      }
    }
  };


  const Occupations = [
      "Managers", "Professionals", "Technicians and Associate Professionals", "Clerical Support Workers", "Service Workers",
      "Skilled Agricultural, Forestry and Fishery Workers", "Craft and Related Trades Workers", "Plant and Machine Operators and Assemblers",
      "Elementary Occupations", "Armed Forces Occupations", "Not Working"
  ];

  const Income = [
      "None", "Less than ₱10,000", "₱10,000 - ₱29,588", "₱29,589 - ₱39,999", "₱40,000 - ₱59,999",
      "₱60,000 - ₱99,999", "₱100,000 - ₱249,999", "₱250,000 - ₱499,999", "₱500,000 and Over"
  ];

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{'--width':'100%','--height':'100%',}} >
            <IonHeader>
                <IonToolbar
                    style={{
                        '--background': '#002d54',
                        color: '#fff',
                    }}
                >
                    <IonTitle
                        style={{
                            fontWeight: 'bold',
                        }}
                    >
                        {isEditing ? 'Edit Profile' : 'Add Profile'}
                    </IonTitle>

                    {/* Close button */}
                    <IonButton
                        slot="end" 
                        onClick={onClose}
                        style={{
                            '--background': '#fff',
                            '--color': '#000000ff',
                            borderRadius: '8px',
                            marginRight: '10px',
                            fontWeight: 'bold',
                        }}
                    >
                        Close
                     </IonButton>

                </IonToolbar>
            </IonHeader>

            <IonContent ref={containerRef} className="ion-padding" style={{ "--background": "#fff" }}>
              
              {/* Teenage Mother Information Card */}
          <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff" }}>
            <IonCardContent>
              <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '2rem', textAlign: 'center' }}>
                Teenage Mother Information
              </h2>

            {/* Teenage Mother Basic INFORMATION */}
            <IonItemGroup>
              <IonItemDivider
                style={{
                  "--color": "#002d54",
                  fontWeight: "bold",
                  "--background": "#fff",
                  fontSize: "20px",
                }}
              >
                Teenage Mother's Basic Information
              </IonItemDivider>
                <IonGrid>
                  <IonRow>
                    {/* First Name */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff" }}>
                        <IonInput
                            className='ion-margin'
                            label="First Name"
                            labelPlacement="floating"
                            fill="outline"
                            style={{ "--color": "#000" }}
                            value={profileData.firstName}
                            required
                            onIonChange={(e) =>
                                handleChange("firstName", e.detail.value!)
                            }
                        />
                      </IonItem>
                    </IonCol>
                    {/* Last Name */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff" }}>
                        <IonInput
                            className='ion-margin'
                            label="Last Name"
                            labelPlacement="floating"
                            fill="outline"
                            style={{ "--color": "#000" }}
                            required
                            value={profileData.lastName}
                            onIonChange={(e) =>
                                handleChange("lastName", e.detail.value!)
                            }
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <IonGrid>
                  <IonRow>
                    {/* Age */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff" }}>
                        <IonInput
                            className='ion-margin'
                            label="Age"
                            type="number"
                            labelPlacement="floating"
                            fill="outline"
                            style={{ "--color": "#000" }}
                            value={profileData.age}
                            onIonChange={(e) => handleChange("age", e.detail.value!)}
                        />
                      </IonItem>
                    </IonCol>

                    {/* Date of Birth */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff" }}>
                        <IonInput
                            className='ion-margin'
                            label="Date of Birth"
                            type="date"
                            labelPlacement="floating"
                            fill="outline"
                            style={{ "--color": "#000" }}
                            value={profileData.birthdate}
                            onIonChange={(e) =>
                                handleChange("birthdate", e.detail.value!)
                            }
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <IonGrid>
                  <IonRow>
                    {/* contact number */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff" }}>
                        <IonInput
                            className='ion-margin'
                            label="Contact Number"
                            labelPlacement="floating"
                            fill="outline"
                            style={{ "--color": "#000" }}
                            value={profileData.contactnum}
                            onIonChange={(e) =>
                                handleChange("contactnum", e.detail.value!)
                            }
                        />
                      </IonItem>
                    </IonCol>
                    {/* Marital Status */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                            className='ion-margin'
                            label="Marital Status"
                            fill="outline"
                            labelPlacement="floating"
                            style={{"--color": "#000" }}
                            value={profileData.marital_status}
                            onIonChange={(e) => handleChange("marital_status", e.detail.value!)}
                        >
                          <IonSelectOption value="married">Married</IonSelectOption>
                          <IonSelectOption value="single">Single</IonSelectOption>
                          <IonSelectOption value="live-in">Common-law/Live-in</IonSelectOption>
                          <IonSelectOption value="separated">Separated</IonSelectOption>
                          <IonSelectOption value="widowed">Widowed</IonSelectOption>
                          <IonSelectOption value="divorced">Divorced</IonSelectOption>
                          <IonSelectOption value="annulled">Annulled</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <IonGrid>
                  <IonRow>
                    {/* Religion */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                            className='ion-margin'
                            label="Religion"
                            fill="outline"
                            labelPlacement="floating"
                            value={profileData.religion}
                            style={{ "--color": "#000" }}
                            onIonChange={(e) => handleChange("religion", e.detail.value!)}
                        >
                          <IonSelectOption value="Catholic">Roman Catholic</IonSelectOption>
                          <IonSelectOption value="Evangelicals">Evangelicals</IonSelectOption>
                          <IonSelectOption value="Islam">Islam</IonSelectOption>
                          <IonSelectOption value="Iglesia Ni Cristo">Iglesia ni Cristo</IonSelectOption>
                          <IonSelectOption value="Others">Others Religious Affiliations</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonCol>

                    {/* Live With */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                            className='ion-margin'
                            label="Live With"
                            fill="outline"
                            labelPlacement="floating"
                            style={{ "--color": "#000" }}
                            value={profileData.living_with}
                            onIonChange={(e) => handleChange("living_with", e.detail.value!)}
                        >
                          <IonSelectOption value="Living with Both Parents">Both Parents</IonSelectOption>
                          <IonSelectOption value="Living with Mother">Mother</IonSelectOption>
                          <IonSelectOption value="Living with Father">Father</IonSelectOption>
                          <IonSelectOption value="Living with Relatives">Relatives</IonSelectOption>
                          <IonSelectOption value="Living with Partners">Partner</IonSelectOption>
                          <IonSelectOption value="Not living with Parents">Not living with Parents</IonSelectOption>
                          <IonSelectOption value="Alone">Alone</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonCol>    
                  </IonRow>
                </IonGrid>

                <IonGrid>
                  <IonRow>
                    {/* Teenage Mother occupation */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Teenage Mother's Occupation"
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={profileData.teenage_occupation}
                                onIonChange={(e) => handleChange("teenage_occupation", e.detail.value!)}
                        >
                          {Occupations.map((occupation, index) => (
                            <IonSelectOption key={index} value={occupation}>{occupation}</IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    </IonCol>

                    {/* Teenage Mother Income */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Teenage Mother's Monthly Income"
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={profileData.teenage_income}
                                onIonChange={(e) => handleChange("teenage_income", e.detail.value!)}
                        >
                          {Income.map((incomeRange, index) => (
                            <IonSelectOption key={index} value={incomeRange}>{incomeRange}</IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <IonGrid>
                  <IonRow>
                  {/*Indigenous Ethnicity */}
                  <IonLabel style={{ fontWeight: 'bold', color: '#000', }}>
                  Member of Indigenous Cultural Community?
                  </IonLabel>
                    <IonCol >
                      <IonItem lines="none" style={{"--background": "#fff","--color": "#000","--background-hover": "transparent",}}>

                        <IonRadioGroup
                          value={isIndigenous}
                          onIonChange={(e) => {
                            setIsIndigenous(e.detail.value);
                            if (e.detail.value === "No") {
                              handleChange("is_indigenous", "");
                            }
                          }}
                          style={{
                            display: "flex",
                            gap: "1rem",
                            marginTop: "0.5rem",
                          }}
                        >
                          <IonRow>
                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                <IonRadio value="Yes">Yes</IonRadio>
                            </IonItem>
                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                <IonRadio value="No">No</IonRadio>
                            </IonItem>
                          </IonRow>
                        </IonRadioGroup>
                      </IonItem>

                    </IonCol>
                    
                    <IonCol size='12' size-md='6'>
                        <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                          <IonInput
                            className='ion-margin'
                            label="Specify Indigenous Cultural Community"
                            type="text"
                            labelPlacement="floating"
                            fill="outline"
                            style={{ "--color": "#000" }}
                            value={profileData.indigenous_ethnicity}
                            onIonChange={(e) =>
                              handleChange("indigenous_ethnicity", e.detail.value!)
                            }
                            disabled={isIndigenous !== 'Yes'}
                          />
                        </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <IonGrid>
                  <IonRow>
                    {/*Fathers Occupation*/}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Father's Occupation"
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={profileData.fathers_occupation}
                                onIonChange={(e) => handleChange("fathers_occupation", e.detail.value!)}
                            >
                              {Occupations.map((occupation, index) => (
                                <IonSelectOption key={index} value={occupation}>{occupation}</IonSelectOption>
                              ))}
                            </IonSelect>
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Father's Income"
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={profileData.fathers_income}
                                onIonChange={(e) => handleChange("fathers_income", e.detail.value!)}
                            >
                              {Income.map((incomeRange, index) => (
                                <IonSelectOption key={index} value={incomeRange}>{incomeRange}</IonSelectOption>
                              ))}
                            </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <IonGrid>
                  <IonRow>
                  {/*Mothers Occupation*/}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Mother's Occupation"
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={profileData.mothers_occupation}
                                onIonChange={(e) => handleChange("mothers_occupation", e.detail.value!)}
                            >
                              {Occupations.map((occupation, index) => (
                                <IonSelectOption key={index} value={occupation}>{occupation}</IonSelectOption>
                              ))}
                            </IonSelect>
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Mother's Income"  
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={profileData.mothers_income}
                                onIonChange={(e) => handleChange("mothers_income", e.detail.value!)}
                            >
                              {Income.map((incomeRange, index) => (
                                <IonSelectOption key={index} value={incomeRange}>{incomeRange}</IonSelectOption>
                              ))}
                            </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>
            </IonItemGroup>

            {/* ADDRESS */}
            <IonItemGroup>
              <IonItemDivider
                style={{
                  "--color": "#000",
                  fontWeight: "bold",
                  "--background": "#fff",
                }}
              >
                Address
              </IonItemDivider>

              <IonGrid>
                <IonRow>
                  {/* REGION */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent',}}>
                      <IonSelect 
                          className='ion-margin'
                          label="Region" 
                          fill="outline" 
                          labelPlacement="floating" 
                          style={{ "--color": "#000", "--background-activated": "transparent" }}
                          value={profileData.region ? (regionlist.find((r: any) => r.name === profileData.region)?.reg_code || '') : ''}
                          onIonChange={(e) => handleRegionChange(e.detail.value)}>
                          {regionlist.map((r, index) => (
                          <IonSelectOption key={`reg-${r.reg_code}-${index}`} value={r.reg_code}>{r.name}</IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                  {/* PROVINCE */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                      <IonSelect 
                          className='ion-margin' 
                          label="Province" fill="outline" 
                          labelPlacement="floating" 
                          style={{ "--color": "#000" }} 
                          value={profileData.province && provincelist.length > 0 ? (provincelist.find((p: any) => p.name === profileData.province)?.prov_code || '') : ''}
                          onIonChange={(e) => handleProvinceChange(e.detail.value)} 
                          disabled={provincelist.length === 0}>
                          {provincelist.map((p, index) => (
                            <IonSelectOption key={`prov-${p.prov_code}-${index}`} value={p.prov_code}>{p.name}</IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                  {/* MUNICIPALITY */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                      <IonSelect 
                          className='ion-margin' 
                          label="Municipality" fill="outline" 
                          labelPlacement="floating" 
                          style={{ "--color": "#000" }} 
                          value={profileData.municipality && municipalitylist.length > 0 ? (municipalitylist.find((m: any) => m.name === profileData.municipality)?.mun_code || '') : ''}
                          onIonChange={(e) => handleMunicipalityChange(e.detail.value)} disabled={municipalitylist.length === 0}>
                          {municipalitylist.map((m, index) => (
                            <IonSelectOption key={`mun-${m.mun_code}-${index}`} value={m.mun_code}>{m.name}</IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>

                  {/* BARANGAY */}
                  <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent',}}>
                        <IonSelect 
                            className='ion-margin' 
                            label="Barangay" 
                            fill="outline" 
                            labelPlacement="floating" 
                            style={{ "--color": "#000" }}
                            value={profileData.barangay || ''}
                            onIonChange={(e) => handleChange("barangay", e.detail.value)} 
                            disabled={barangaylist.length === 0}>
                            {barangaylist.map((b, index) => (
                              <IonSelectOption key={`${b.mun_code}-${b.name}-${index}`} value={b.name}>{b.name}</IonSelectOption>
                            ))}
                          </IonSelect>
                      </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                  {/* Zip Code */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff" }}>
                      <IonInput
                          className='ion-margin'
                          label="Zip Code"
                          labelPlacement="floating"
                          fill="outline"
                          style={{ "--color": "#000" }}
                          value={profileData.zipcode}
                          onIonChange={(e) =>
                              handleChange("zipcode", e.detail.value!)
                          }
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonItemGroup>

            {/* Educational Background */}
            <IonItemGroup>
                <IonItemDivider
                    style={{
                    "--color": "#000",
                    fontWeight: "bold",
                    "--background": "#fff",
                    }}
                >
                    Educational Background
                </IonItemDivider>

                <IonRow>
                    {/* Type Of School Attended */}
                    <IonCol size='12' size-md='6'>
                        <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                          <IonSelect
                              className='ion-margin'
                              label="Type of School Attended"
                              fill="outline"
                              labelPlacement="floating"
                              style={{"--color": "#000" }}
                              value={profileData.type_of_school}
                              onIonChange={(e) => handleChange("type_of_school", e.detail.value!)}
                          >
                            <IonSelectOption value="Private">Private</IonSelectOption>
                            <IonSelectOption value="Public">Public</IonSelectOption>
                          </IonSelect>
                        </IonItem>
                    </IonCol>

                    {/* Current Year Level Of Education */}
                    <IonCol size='12' size-md='6'>
                        <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                              className='ion-margin'
                              label="Current Year Level Of Education"
                              fill="outline"
                              labelPlacement="floating"
                              style={{"--color": "#000" }}
                              value={profileData.current_year_level}
                              onIonChange={(e) => handleChange("current_year_level", e.detail.value!)}
                          >
                            <IonSelectOption value="Grade 1">Grade 1</IonSelectOption>
                            <IonSelectOption value="Grade 2">Grade 2</IonSelectOption>
                            <IonSelectOption value="Grade 3">Grade 3</IonSelectOption>
                            <IonSelectOption value="Grade 4">Grade 4</IonSelectOption>
                            <IonSelectOption value="Grade 5">Grade 5</IonSelectOption>
                            <IonSelectOption value="Grade 6">Grade 6</IonSelectOption>
                            <IonSelectOption value="Grade 7">Grade 7</IonSelectOption>
                            <IonSelectOption value="Grade 8">Grade 8</IonSelectOption>
                            <IonSelectOption value="Grade 9">Grade 9</IonSelectOption>
                            <IonSelectOption value="Grade 10">Grade 10</IonSelectOption>
                            <IonSelectOption value="Grade 11">Grade 11</IonSelectOption>
                            <IonSelectOption value="Grade 12">Grade 12</IonSelectOption>
                            <IonSelectOption value="1st Year College">1st Year College</IonSelectOption>
                            <IonSelectOption value="2nd Year College">2nd Year College</IonSelectOption>
                            <IonSelectOption value="3rd Year College">3rd Year College</IonSelectOption>
                            <IonSelectOption value="4th Year College">4th Year College</IonSelectOption>
                            <IonSelectOption value="Vocational Training">Vocational Training</IonSelectOption>
                            <IonSelectOption value="ALS Elementary">ALS Elementary</IonSelectOption>
                            <IonSelectOption value="ALS Secondary">ALS Secondary</IonSelectOption>
                            <IonSelectOption value="Not Attending School">Not Attending School</IonSelectOption>
                          </IonSelect>
                        </IonItem>
                    </IonCol>
                </IonRow>

                {/* Highest Educational Attainment */}
                <IonRow>
                  <IonCol>
                     <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                              className='ion-margin'
                              label="Highest Educational Attainment"
                              fill="outline"
                              labelPlacement="floating"
                              style={{"--color": "#000" }}
                              value={profileData.highest_educational_attainment}
                              onIonChange={(e) => handleChange("highest_educational_attainment", e.detail.value!)}
                          >
                            <IonSelectOption value="Grade 1">Grade 1</IonSelectOption>
                            <IonSelectOption value="Grade 2">Grade 2</IonSelectOption>
                            <IonSelectOption value="Grade 3">Grade 3</IonSelectOption>
                            <IonSelectOption value="Grade 4">Grade 4</IonSelectOption>
                            <IonSelectOption value="Grade 5">Grade 5</IonSelectOption>
                            <IonSelectOption value="Grade 6">Grade 6</IonSelectOption>
                            <IonSelectOption value="Grade 7">Grade 7</IonSelectOption>
                            <IonSelectOption value="Grade 8">Grade 8</IonSelectOption>
                            <IonSelectOption value="Grade 9">Grade 9</IonSelectOption>
                            <IonSelectOption value="Grade 10">Grade 10</IonSelectOption>
                            <IonSelectOption value="Grade 11">Grade 11</IonSelectOption>
                            <IonSelectOption value="Grade 12">Grade 12</IonSelectOption>
                            <IonSelectOption value="1st Year College">1st Year College</IonSelectOption>
                            <IonSelectOption value="2nd Year College">2nd Year College</IonSelectOption>
                            <IonSelectOption value="3rd Year College">3rd Year College</IonSelectOption>
                            <IonSelectOption value="4th Year College">4th Year College</IonSelectOption>
                            <IonSelectOption value="Vocational Training">Vocational Training</IonSelectOption>
                            <IonSelectOption value="ALS Elementary">ALS Elementary</IonSelectOption>
                            <IonSelectOption value="ALS Secondary">ALS Secondary</IonSelectOption>
                          </IonSelect>
                     </IonItem>
                  </IonCol>
                </IonRow>
            </IonItemGroup>

             {/* Multiple Partners */}
            <IonItemGroup>
              <IonGrid>
                  <IonRow>
                    <IonLabel style={{ fontWeight: 'bold', color: '#000', }}>
                    Prevalence of Multiple Partners
                    </IonLabel>
                    <IonCol>
                      <IonItem lines="none" style={{"--background": "#fff","--color": "#000","--background-hover": "transparent",}}>
                        
                        <IonRadioGroup
                          value={isMultiplePartners}
                          onIonChange={(e) => {
                            setIsMultiplePartners(e.detail.value);
                            if (e.detail.value === "No") {
                              handleChange("multiple_partners", "");
                            }
                          }}
                          style={{
                            display: "flex",
                            gap: "1rem",
                            marginTop: "0.5rem",
                          }}
                        >
                          <IonRow>
                          <IonItem lines="none" style={{ "--background": "#fff" }}>
                              <IonRadio value="Yes">Yes</IonRadio>
                          </IonItem>
                          <IonItem lines="none" style={{ "--background": "#fff" }}>
                              <IonRadio value="No">No</IonRadio>
                          </IonItem>
                          </IonRow>
                        </IonRadioGroup>
                      </IonItem>
                   </IonCol>

                    <IonCol size='12' size-md='6'>
                        <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                          <IonInput
                            className='ion-margin'
                            label="Partners Have Been with Since First Pregnancy"
                            type="number"
                            labelPlacement="floating"
                            fill="outline"
                            style={{ "--color": "#000" }}
                            value={profileData.multiple_partner_num}
                            onIonChange={(e) =>
                              handleChange("multiple_partner_num", e.detail.value!)
                            }
                            disabled={isMultiplePartners !== 'Yes'}
                          />
                        </IonItem>
                    </IonCol>
                  </IonRow>
              </IonGrid>
            </IonItemGroup>

            {/* Save Button for Mother Info */}
            <IonRow className="ion-justify-content-center ion-margin-top">
              <IonCol size="auto">
                <IonButton 
                  color="primary" 
                  onClick={handleSaveMotherInfo}
                  disabled={loading}
                >
                  {loading ? <IonSpinner name="lines-small" /> : (motherInfoComplete ? 'Update Mother Info' : 'Save Mother Info')}
                </IonButton>
              </IonCol>
            </IonRow>

            {motherInfoComplete && (
              <IonRow>
                <IonCol>
                  <div style={{ color: 'green', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                    ✓ Teenage Mother Information Saved Successfully
                  </div>
                </IonCol>
              </IonRow>
            )}
            </IonCardContent>
          </IonCard>

            {/* Teenage Father Information Card */}
          <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff" }}>
            <IonCardContent>
              <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '2rem', textAlign: 'center' }}>
                Teenage Father Information
              </h2>

              {!motherInfoComplete && !isEditing && (
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffc107', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  textAlign: 'center',
                  color: '#856404'
                }}>
                  <strong>Note:</strong> Please save Teenage Mother Information first before adding Teenage Father Information.
                </div>
              )}
             {/*TeenageFather INFORMATION */}
            <IonItemGroup>
              <IonItemDivider
                style={{
                  "--color": "#002d54",
                  fontWeight: "bold",
                  "--background": "#fff",
                  fontSize: "20px",

                }}
              >
                Teenage Father Information
              </IonItemDivider>

              <IonGrid>
                <IonRow>
                  {/* Partner's First Name */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", }}>
                      <IonInput
                        className='ion-margin'
                        type="text" 
                        label="First Name"
                        labelPlacement="floating"
                        fill='outline'
                        style={{ "--color": "#000" }}
                        value={partnersData.pFirstname}
                        onIonChange={(e) => handleChange("pFirstname", e.detail.value!)}
                      />
                    </IonItem>
                  </IonCol>
                  {/* Partner's Last Name */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", }}>
                      <IonInput
                        className='ion-margin'
                        type="text" 
                        label="Partner's Last Name"
                        labelPlacement="floating"
                        fill='outline'
                        style={{ "--color": "#000" }}
                        value={partnersData.pLastname}
                        onIonChange={(e) => handleChange("pLastname", e.detail.value!)}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                  {/* Partner's Age */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                      <IonInput
                        className='ion-margin'
                        type="number" 
                        label="Partner's Age"
                        fill='outline'
                        labelPlacement="floating"
                        style={{ "--color": "#000" }}
                        value={partnersData.pAge}
                        onIonChange={(e) => handleChange("pAge", e.detail.value!)}
                      />
                    </IonItem>
                  </IonCol>
                  {/* Date of Birth */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff" }}>
                      <IonInput
                          className='ion-margin'
                          label="Date of Birth"
                          type="date"
                          labelPlacement="floating"
                          fill="outline"
                          style={{ "--color": "#000" }}
                          value={partnersData.pBirthdate}
                          onIonChange={(e) =>
                              handleChange("pBirthdate", e.detail.value!)
                          }
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                  {/* Partner Contact Number */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff" }}>
                      <IonInput
                        className='ion-margin'
                        type="text" 
                        label=" Contact Number"
                        labelPlacement="floating"
                        fill='outline'
                        style={{ "--color": "#000" }}
                        value={partnersData.contact_num}
                        onIonChange={(e) => handleChange("contact_num", e.detail.value!)}
                      />
                    </IonItem>
                  </IonCol>

                  {/* Partner Marital Status */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                      <IonSelect
                        className='ion-margin'
                        label="Partner's Marital Status"
                        fill="outline"
                        labelPlacement="floating"
                        style={{ "--color": "#000" }}
                        value={partnersData.marital_status}
                        onIonChange={(e) => handleChange("pMarital_status", e.detail.value!)}
                      >
                        <IonSelectOption value="married">Married</IonSelectOption>
                        <IonSelectOption value="single">Single</IonSelectOption>
                        <IonSelectOption value="live-in">Common-law/Live-in</IonSelectOption>
                        <IonSelectOption value="separated">Separated</IonSelectOption>
                        <IonSelectOption value="widowed">Widowed</IonSelectOption>
                        <IonSelectOption value="divorced">Divorced</IonSelectOption>
                        <IonSelectOption value="annulled">Annulled</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                  {/* Partner Religion */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                      <IonSelect
                        className='ion-margin'
                        label="Religion"
                        fill="outline"
                        labelPlacement="floating"
                        style={{ "--color": "#000" }}
                        value={partnersData.religion}
                        onIonChange={(e) => handleChange("pReligion", e.detail.value!)}
                      >
                        <IonSelectOption value="Catholic">Roman Catholic</IonSelectOption>
                        <IonSelectOption value="Evangelicals">Evangelicals</IonSelectOption>
                        <IonSelectOption value="Islam">Islam</IonSelectOption>
                        <IonSelectOption value="Iglesia Ni Cristo">Iglesia ni Cristo</IonSelectOption>
                        <IonSelectOption value="Others">Others Religious Affiliations</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonCol>

                  {/* Partner Living With */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                      <IonSelect
                        className='ion-margin'
                        label="Living With"
                        fill="outline"
                        labelPlacement="floating"
                        style={{ "--color": "#000" }}
                        value={partnersData.living_with}
                        onIonChange={(e) => handleChange("pLiving_with", e.detail.value!)}
                      >
                        <IonSelectOption value="Living with Both Parents">Both Parents</IonSelectOption>
                        <IonSelectOption value="Living with Mother">Mother</IonSelectOption>
                        <IonSelectOption value="Living with Father">Father</IonSelectOption>
                        <IonSelectOption value="Living with Relatives">Relatives</IonSelectOption>
                        <IonSelectOption value="Living with Partners">Partner</IonSelectOption>
                        <IonSelectOption value="Not living with Parents">Not living with Parents</IonSelectOption>
                        <IonSelectOption value="Alone">Alone</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                {/*Partner Occupation */}
                <IonCol size='12' size-md='6'>
                  <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                    <IonSelect
                            className='ion-margin'
                            label="Occupation"
                            fill="outline"
                            labelPlacement="floating"
                            style={{ "--color": "#000" }}
                            value={partnersData.pOccupation}
                            onIonChange={(e) => handleChange("pOccupation", e.detail.value!)}
                        >
                          {Occupations.map((occupation, index) => (
                            <IonSelectOption key={index} value={occupation}>{occupation}</IonSelectOption>
                          ))}
                        </IonSelect>
                  </IonItem>
                </IonCol>
                {/*Partner Income*/}
                <IonCol size='12' size-md='6'>
                  <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                    <IonSelect
                            className='ion-margin'
                            label="Partner's Income"
                            fill="outline"
                            labelPlacement="floating"
                            style={{ "--color": "#000" }}
                            value={partnersData.pIncome}
                            onIonChange={(e) => handleChange("pIncome", e.detail.value!)}
                        >
                          {Income.map((incomeRange, index) => (
                            <IonSelectOption key={index} value={incomeRange}>{incomeRange}</IonSelectOption>
                          ))}
                        </IonSelect>
                  </IonItem>
                </IonCol>             
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                    {/*partners Indigenous Ethnicity */}
                  <IonLabel style={{ fontWeight: 'bold', color: '#000', }}>
                  Member of Indigenous Cultural Community?
                  </IonLabel>
                    <IonCol >
                      <IonItem lines="none" style={{"--background": "#fff","--color": "#000","--background-hover": "transparent",}}>

                        <IonRadioGroup
                          value={isPartnerIndigenous}
                          color='black'
                          onIonChange={(e) => {
                            setIsPartnerIndigenous(e.detail.value);
                            if (e.detail.value === "No") {
                              handleChange("pIndigenous_ethnicity", '');
                            }
                          }}
                          style={{
                            display: "flex",
                            gap: "1rem",
                            marginTop: "0.5rem",
                            
                          }}
                        >
                          <IonRow>
                            <IonItem lines="none" style={{ "--background": "#fff",  }}>
                                <IonRadio value="Yes" color ='dark'>Yes</IonRadio>
                            </IonItem>
                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                <IonRadio value="No">No</IonRadio>
                            </IonItem>
                          </IonRow>
                        </IonRadioGroup>
                      </IonItem>
                    </IonCol>
                    
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonInput
                          className='ion-margin'
                          label="Specify Indigenous Cultural Community"
                          type="text"
                          labelPlacement="floating"
                          fill="outline"
                          style={{ "--color": "#000" }}
                          value={partnersData.indigenous_ethnicity}
                          onIonChange={(e) =>
                            handleChange("pIndigenous_ethnicity", e.detail.value!)
                          }
                          disabled={isPartnerIndigenous !== 'Yes'}
                        />
                      </IonItem>
                    </IonCol>
                </IonRow>
              </IonGrid> 

                {/* Fathers Occupation and Income */}
                <IonGrid>
                  <IonRow>
                    {/*Fathers Occupation*/}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Father's Occupation"
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={partnersData.fathers_occupation}
                                onIonChange={(e) => handleChange("pFathers_occupation", e.detail.value!)}
                            >
                              {Occupations.map((occupation, index) => (
                                <IonSelectOption key={index} value={occupation}>{occupation}</IonSelectOption>
                              ))}
                            </IonSelect>
                      </IonItem>
                    </IonCol>

                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                         <IonSelect
                                className='ion-margin'
                                label="Father's Income"
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={partnersData.fathers_income}
                                onIonChange={(e) => handleChange("pFathers_income", e.detail.value!)}
                            >
                              {Income.map((incomeRange, index) => (
                                <IonSelectOption key={index} value={incomeRange}>{incomeRange}</IonSelectOption>
                              ))}
                            </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>
              </IonGrid>    

              {/* Mother's Occupation and Income */}
              <IonGrid>
                <IonRow>
                  {/*Mothers Occupation*/}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Mother's Occupation"
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={partnersData.mothers_occupation}
                                onIonChange={(e) => handleChange("pMothers_occupation", e.detail.value!)}
                            >
                              {Occupations.map((occupation, index) => (
                                <IonSelectOption key={index} value={occupation}>{occupation}</IonSelectOption>
                              ))}
                            </IonSelect>
                      </IonItem>
                    </IonCol>
                    {/*Mothers Income*/}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff","--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                                className='ion-margin'
                                label="Mother's Income"  
                                fill="outline"
                                labelPlacement="floating"
                                style={{ "--color": "#000" }}
                                value={partnersData.mothers_income}
                                onIonChange={(e) => handleChange("pMothers_income", e.detail.value!)}
                            >
                              {Income.map((incomeRange, index) => (
                                <IonSelectOption key={index} value={incomeRange}>{incomeRange}</IonSelectOption>
                              ))}
                            </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>
            </IonItemGroup>

             {/* TeenageFather ADDRESS */}
            <IonItemGroup>
              <IonItemDivider
                style={{
                  "--color": "#000",
                  fontWeight: "bold",
                  "--background": "#fff",
                }}
              >
                Address
              </IonItemDivider>

              <IonGrid>
                <IonRow>
                  {/* Partner REGION */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent',}}>
                      <IonSelect 
                          className='ion-margin'
                          label="Region" 
                          fill="outline" 
                          labelPlacement="floating" 
                          style={{ "--color": "#000", "--background-activated": "transparent" }}
                          value={regionlist.find((r: any) => r.name === partnersData.region)?.reg_code || ''}
                          onIonChange={(e) => handlePartnerRegionChange(e.detail.value)}>
                          {regionlist.map((r, index) => (
                            <IonSelectOption key={`partner-reg-${r.reg_code}-${index}`} value={r.reg_code}>{r.name}</IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                  
                  {/* Partner PROVINCE */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                      <IonSelect 
                          className='ion-margin' 
                          label="Province" 
                          fill="outline" 
                          labelPlacement="floating" 
                          style={{ "--color": "#000" }} 
                          value={partnersProvincelist.find((p: any) => p.name === partnersData.province)?.prov_code || ''} 
                          onIonChange={(e) => handlePartnerProvinceChange(e.detail.value)} 
                          disabled={partnersProvincelist.length === 0}>
                          {partnersProvincelist.map((p, index) => (
                            <IonSelectOption key={`partner-prov-${p.prov_code}-${index}`} value={p.prov_code}>{p.name}</IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                  {/* Partner MUNICIPALITY */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                      <IonSelect 
                          className='ion-margin' 
                          label="Municipality" 
                          fill="outline" 
                          labelPlacement="floating" 
                          style={{ "--color": "#000" }} 
                          value={partnersMunicipalitylist.find((m: any) => m.name === partnersData.municipality)?.mun_code || ''}
                          onIonChange={(e) => handlePartnerMunicipalityChange(e.detail.value)} 
                          disabled={partnersMunicipalitylist.length === 0}>
                          {partnersMunicipalitylist.map((m, index) => (
                            <IonSelectOption key={`partner-mun-${m.mun_code}-${index}`} value={m.mun_code}>{m.name}</IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>

                  {/* Partner BARANGAY */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent',}}>
                      <IonSelect 
                          className='ion-margin' 
                          label="Barangay" 
                          fill="outline" 
                          labelPlacement="floating" 
                          style={{ "--color": "#000" }}
                          value={partnersData.barangay || ''}
                          onIonChange={(e) => handleChange("pBarangay", e.detail.value)} 
                          disabled={partnersBarangaylist.length === 0}>
                          {partnersBarangaylist.map((b, index) => (
                            <IonSelectOption key={`partner-${b.mun_code}-${b.name}-${index}`} value={b.name}>{b.name}</IonSelectOption>
                          ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonGrid>
                <IonRow>
                  {/* Partner Zip Code */}
                  <IonCol size='12' size-md='6'>
                    <IonItem lines="none" style={{ "--background": "#fff" }}>
                      <IonInput
                          className='ion-margin'
                          label="Zip Code"
                          labelPlacement="floating"
                          fill="outline"
                          style={{ "--color": "#000" }}
                          value={partnersData.zipcode}
                          onIonChange={(e) =>
                              handleChange("pZipcode", e.detail.value!)
                          }
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonItemGroup>

              {/*TEENAGE FATHER Educational Background */}
            <IonItemGroup>
                <IonItemDivider
                    style={{
                    "--color": "#000",
                    fontWeight: "bold",
                    "--background": "#fff",
                    }}
                >
                  Partner's Educational Background
                </IonItemDivider>

                <IonRow>
                    {/* Type Of School Attended */}
                    <IonCol size='12' size-md='6'>
                      <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                          className='ion-margin'
                          label="Type of School Attended"
                          fill="outline"
                          labelPlacement="floating"
                          style={{"--color": "#000" }}
                          value={partnersData.type_of_school}
                          onIonChange={(e) => handleChange("pType_of_school", e.detail.value!)}
                        >
                          <IonSelectOption value="Private">Private</IonSelectOption>
                          <IonSelectOption value="Public">Public</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonCol>

                    {/* Current Year Level Of Education */}
                    <IonCol size='12' size-md='6'>
                        <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                              className='ion-margin'
                              label="Current Year Level Of Education"
                              fill="outline"
                              labelPlacement="floating"
                              style={{"--color": "#000" }}
                              value={partnersData.current_year_level}
                             onIonChange={(e) => handleChange("pCurrent_year_level", e.detail.value!)}
                          >
                            <IonSelectOption value="Grade 1">Grade 1</IonSelectOption>
                            <IonSelectOption value="Grade 2">Grade 2</IonSelectOption>
                            <IonSelectOption value="Grade 3">Grade 3</IonSelectOption>
                            <IonSelectOption value="Grade 4">Grade 4</IonSelectOption>
                            <IonSelectOption value="Grade 5">Grade 5</IonSelectOption>
                            <IonSelectOption value="Grade 6">Grade 6</IonSelectOption>
                            <IonSelectOption value="Grade 7">Grade 7</IonSelectOption>
                            <IonSelectOption value="Grade 8">Grade 8</IonSelectOption>
                            <IonSelectOption value="Grade 9">Grade 9</IonSelectOption>
                            <IonSelectOption value="Grade 10">Grade 10</IonSelectOption>
                            <IonSelectOption value="Grade 11">Grade 11</IonSelectOption>
                            <IonSelectOption value="Grade 12">Grade 12</IonSelectOption>
                            <IonSelectOption value="1st Year College">1st Year College</IonSelectOption>
                            <IonSelectOption value="2nd Year College">2nd Year College</IonSelectOption>
                            <IonSelectOption value="3rd Year College">3rd Year College</IonSelectOption>
                            <IonSelectOption value="4th Year College">4th Year College</IonSelectOption>
                            <IonSelectOption value="Vocational Training">Vocational Training</IonSelectOption>
                            <IonSelectOption value="ALS Elementary">ALS Elementary</IonSelectOption>
                            <IonSelectOption value="ALS Secondary">ALS Secondary</IonSelectOption>
                            <IonSelectOption value="Not Attending School">Not Attending School</IonSelectOption>
                          </IonSelect>
                        </IonItem>
                    </IonCol>
                </IonRow>

                {/* Highest Educational Attainment */}
                <IonRow>
                  <IonCol>
                     <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                        <IonSelect
                              className='ion-margin'
                              label="Highest Educational Attainment"
                              fill="outline"
                              labelPlacement="floating"
                              style={{"--color": "#000" }}
                              value={partnersData.highest_educational_attainment}
                              onIonChange={(e) => handleChange("pHighest_educational_attainment", e.detail.value!)}
                          >
                            <IonSelectOption value="Grade 1">Grade 1</IonSelectOption>
                            <IonSelectOption value="Grade 2">Grade 2</IonSelectOption>
                            <IonSelectOption value="Grade 3">Grade 3</IonSelectOption>
                            <IonSelectOption value="Grade 4">Grade 4</IonSelectOption>
                            <IonSelectOption value="Grade 5">Grade 5</IonSelectOption>
                            <IonSelectOption value="Grade 6">Grade 6</IonSelectOption>
                            <IonSelectOption value="Grade 7">Grade 7</IonSelectOption>
                            <IonSelectOption value="Grade 8">Grade 8</IonSelectOption>
                            <IonSelectOption value="Grade 9">Grade 9</IonSelectOption>
                            <IonSelectOption value="Grade 10">Grade 10</IonSelectOption>
                            <IonSelectOption value="Grade 11">Grade 11</IonSelectOption>
                            <IonSelectOption value="Grade 12">Grade 12</IonSelectOption>
                            <IonSelectOption value="1st Year College">1st Year College</IonSelectOption>
                            <IonSelectOption value="2nd Year College">2nd Year College</IonSelectOption>
                            <IonSelectOption value="3rd Year College">3rd Year College</IonSelectOption>
                            <IonSelectOption value="4th Year College">4th Year College</IonSelectOption>
                            <IonSelectOption value="Vocational Training">Vocational Training</IonSelectOption>
                            <IonSelectOption value="ALS Elementary">ALS Elementary</IonSelectOption>
                            <IonSelectOption value="ALS Secondary">ALS Secondary</IonSelectOption>
                          </IonSelect>
                     </IonItem>
                  </IonCol>
                </IonRow>
            </IonItemGroup>

            <IonRow className="ion-justify-content-center ion-margin-top">
                <IonCol size="auto">
                  <IonButton 
                    color="primary" 
                    onClick={handleSaveFatherInfo}
                    disabled={loading || (!motherInfoComplete && !isEditing)}
                  >
                    {loading ? <IonSpinner name="lines-small" /> : (isEditing ? 'Update & Close' : 'Save & Close')}
                  </IonButton>
                </IonCol>
                <IonCol size="auto">
                  <IonButton color="medium" fill="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>
            
            {error && (
              <div style={{ color: error.includes('successfully') ? 'green' : 'red', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                {error}
              </div>
            )}
            </IonContent>
        </IonModal>
    );
};

export default AddProfileModal;
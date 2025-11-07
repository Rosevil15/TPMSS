import { IonButton, IonCard, IonCardContent, IonCheckbox, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClients';

interface AddHealthRecordProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (profile: any) => Promise<void>;
    editingHealth?: any | null;
    isEditing?: boolean;
}

interface ProfileOption {
    profileid: number;
    firstName: string | null;
    lastName: string | null;
}

interface formState {
    profileid: number | null;
    profileSearch: string;
    pregnancy_status: string;
    stage_of_pregnancy: string;
    medical_history: string[];
    medical_history_others: string;
    num_of_pregnancies: number;
    tentanus_vacc: boolean;
    tetanus_dose: number;
    date_of_last_mens_period: string;
    height: number;
    weight: number;
    temperature: number;
}

const emptyForm: formState = {
    profileid: null,
    profileSearch: '',
    pregnancy_status: '',
    stage_of_pregnancy: '',
    medical_history: [],
    medical_history_others: '',
    num_of_pregnancies: 0,
    tentanus_vacc: false,
    tetanus_dose: 0,
    date_of_last_mens_period: '',
    height: 0,
    weight: 0,
    temperature: 0,
};

const AddHealthRecord: React.FC<AddHealthRecordProps> = ({ isOpen, onClose, onSave, isEditing = false, editingHealth = null }) => {
    const [profiles, setProfiles] = useState<ProfileOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [save, setSave] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<formState>(emptyForm);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredProfiles, setFilteredProfiles] = useState<ProfileOption[]>([]); 
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [prefillLoading, setPrefillLoading] = useState(false);

    const isLoadingEditData = useRef(false);

    useEffect(() => {
       
        if (!isOpen) {
            return;
        }
        
        if (isEditing && editingHealth) {
            
            // Load editing data
            void loadEditingData();
        } else {
            
            // Reset form for new record
            setForm(emptyForm);
        }
        
        setError(null);
        void loadProfiles();
    }, [isOpen, isEditing, editingHealth]);

     const loadEditingData = async () => {
        if (!editingHealth) return;
        
        isLoadingEditData.current = true;
        setPrefillLoading(true);
        try {
            // Load profile data for the search field
            const { data: profileData, error: profileError } = await supabase
                .from('profile')
                .select('profileid, firstName, lastName')
                .eq('profileid', editingHealth.profileid)
                .single();

            if (profileError) throw profileError;

            const profileSearchText = profileData 
                ? `${profileData.lastName ?? ''}, ${profileData.firstName ?? ''} (ID: ${profileData.profileid})`
                : '';

            const knownConditions = [
                "Tuberculosis (14 days or more of cough)",
                "Heart Diseases",
                "Diabetes",
                "Hypertension",
                "Bronchial Asthma",
                "Urinary Tract Infection",
                "Parasitism",
                "Goiter",
                "Anemia",
                "Malnutrition",
                "Genital Tract Infection",
                "None"
            ];

            // Parse medical_history from comma-separated strings
            const medicalHistoryArray = editingHealth.medical_history 
                ? editingHealth.medical_history.split(',').map((item: string) => item.trim())
                : [];

            const knownMedicalHistory = medicalHistoryArray.filter((item: string) => 
                knownConditions.includes(item)
            );

            // Check if there's an "Other" entry in medical history
            const otherMedicalHistory = medicalHistoryArray.filter((item: string) => 
                !knownConditions.includes(item)
            ).join(', ');

            isLoadingEditData.current = false;

            // Set form with editing data
            setForm({
                profileid: editingHealth.profileid,
                profileSearch: profileSearchText,
                pregnancy_status: editingHealth.pregnancy_status || '',
                stage_of_pregnancy: editingHealth.stage_of_pregnancy || '',
                medical_history: knownMedicalHistory,
                medical_history_others: otherMedicalHistory,
                num_of_pregnancies: editingHealth.num_of_pregnancies || 0,
                tentanus_vacc: editingHealth.tentanus_vacc || false,
                tetanus_dose: editingHealth.tetanus_dose || 0,
                date_of_last_mens_period: editingHealth.date_of_last_mens_period || '',
                height: editingHealth.height || 0,
                weight: editingHealth.weight || 0,
                temperature: editingHealth.temperature || 0,
            });
            
        } catch (err) {
            console.error('Error loading editing data:', err);
            setError('Failed to load health record data');
            isLoadingEditData.current = false;
        } finally {
            setPrefillLoading(false);
        }
    };

    const handleProfileSearch = (searchValue: string) => {
        setForm((prevForm) => ({
            ...prevForm,
            profileSearch: searchValue,
            profileid: null,
        }));

        if (searchValue.trim() === '') {
            setFilteredProfiles([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = profiles.filter((profile) => {
            const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.toLowerCase();
            return fullName.includes(searchValue.toLowerCase());
        });

        setFilteredProfiles(filtered);
        setShowSuggestions(true);
    };

    const loadProfiles = async () => {
        setLoading(true);
        try {
            const {data,error} = await supabase
                .from('profile')
                .select('profileid,firstName,lastName')
                .order('lastName',{ascending:true});

                if (error) {
                    setError(error.message);
                } else {
                    setProfiles(data ?? []);
                }
                setLoading(false);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSelect = (profile: ProfileOption) => {
        setError(null);
        setShowSuggestions(false);
        setFilteredProfiles([]);

        setForm({
            ...emptyForm,
            profileid: profile.profileid,
            profileSearch: `${profile.lastName ?? ''}, ${profile.firstName ?? ''} (ID: ${profile.profileid})`,
        });
    };

    const handleChange = <K extends keyof formState>(key: K, value: formState[K]) => {
        setForm((prevForm) => ({
            ...prevForm,
            [key]: value,
        }));
    };

    const handleCheckboxChange = (value: string, checked: boolean, field: 'medical_history') => {
         console.log(`=== CHECKBOX CHANGE ===`);
        console.log(`Field: ${field}, Value: ${value}, Checked: ${checked}`);
        console.log(`Before change - ${field}:`, form[field]);
        
        setForm((prevForm) => {
            const currentArray = prevForm[field] as string[];
            if (checked) {
                return {
                    ...prevForm,
                    [field]: [...currentArray, value],
                };
            } else {
                return {
                    ...prevForm,
                    [field]: currentArray.filter((item) => item !== value),
                   
                };
                
            }
        });
    };
    
    const handleSave = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!form.profileid) {
        setError('Please select a profile');
        return;
    }
    setSave(true);
    setError(null);

    try {

        const medicalHistoryFinal = [...form.medical_history];
        if (form.medical_history_others && form.medical_history_others.trim()) {
            medicalHistoryFinal.push(form.medical_history_others.trim());
        }

        
        const medicalHistoryString = medicalHistoryFinal.length > 0 ? medicalHistoryFinal.join(', ') : '';

        if (isEditing && editingHealth) {
            // Update existing record
            const payload = {
                profileid: form.profileid,
                pregnancy_status: form.pregnancy_status || null,
                stage_of_pregnancy: form.stage_of_pregnancy || null,
                medical_history: medicalHistoryString || null,
                num_of_pregnancies: form.num_of_pregnancies || 0,
                tentanus_vacc: form.tentanus_vacc,
                tetanus_dose: form.tetanus_dose || 0,
                date_of_last_mens_period: form.date_of_last_mens_period || null,
                height: form.height || 0,
                weight: form.weight || 0,
                temperature: form.temperature || 0,
            };

            const { data, error } = await supabase
                .from('maternalhealthRecord')
                .update(payload)
                .eq('health_id', editingHealth.health_id)
                .select(); // Add select() to get the updated data back

            if (error) {
                console.error('UPDATE ERROR');
                console.error('Supabase update error:', error);
                throw error;
            }

            await onSave({ ...payload, health_id: editingHealth.health_id });
            setForm(emptyForm);
            onClose();
        } else {
            const currentYear = new Date().getFullYear();
            let finalHealthId: number;
            let attempts = 0;
            const maxAttempts = 10;
            
            do {
                const randomNum = Math.floor(Math.random() * 10000);
                finalHealthId = parseInt(`${currentYear}${randomNum.toString().padStart(4, '0')}`);
                
                // Check if this ID already exists
                const { data: existingRecord, error: checkError } = await supabase
                    .from('maternalhealthRecord')
                    .select('health_id')
                    .eq('health_id', finalHealthId)
                    .maybeSingle();

                if (checkError) {
                    console.error('Error checking existing health_id:', checkError);
                    throw checkError;
                }

                if (!existingRecord) {
                    break;
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    throw new Error('Could not generate unique health ID after multiple attempts');
                }
            } while (attempts < maxAttempts);
            
            // Create new record
            const payload = {
                health_id: finalHealthId,
                profileid: form.profileid,
                pregnancy_status: form.pregnancy_status || null,
                stage_of_pregnancy: form.stage_of_pregnancy || null,
                medical_history: medicalHistoryString || null,
                num_of_pregnancies: form.num_of_pregnancies || 0,
                tentanus_vacc: form.tentanus_vacc,
                tetanus_dose: form.tetanus_dose || 0,
                date_of_last_mens_period: form.date_of_last_mens_period || null,
                height: form.height || 0,
                weight: form.weight || 0,
                temperature: form.temperature || 0,
            };

            const { data, error } = await supabase
                .from('maternalhealthRecord')
                .insert(payload)
                .select(); 

            if (error) {
                console.error('=== INSERT ERROR ===');
                console.error('Supabase insert error:', error);
                throw error;
            }

            await onSave(payload);
            setForm(emptyForm);
            onClose();
        }
    } catch (error: any) {
        setError(error.message || 'An error occurred while saving');
    } finally {
        setSave(false);
    }
    };

    const showEmptyProfilesMessage = useMemo(
        () => !loading && profiles.length === 0,
        [loading, profiles.length]
    );

    const medicalConditions = [
        "Tuberculosis (14 days or more of cough)",
        "Heart Diseases",
        "Diabetes",
        "Hypertension",
        "Bronchial Asthma",
        "Urinary Tract Infection",
        "Parasitism",
        "Goiter",
        "Anemia",
        "Malnutrition",
        "Genital Tract Infection",
        "None"
    ];

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{'--width':'100%','--height':'100%',}}>
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
                        {isEditing ? 'Edit Health Record' : 'Add Health Record'}
                    </IonTitle>

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

            <IonContent className="ion-padding" style={{ '--background': '#fff' }}>
                {loading || prefillLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <IonSpinner />
                    </div>
                ) :  (
                    <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff",width: isMobile ? '100%' : '90%', margin:'auto' }}>
                        <IonCardContent>
                            {error && (
                                <IonText color="danger" style={{ display: "block", marginBottom: "1rem" }}>
                                    {error}
                                </IonText>
                            )}

                            {/* PROFILE SELECTION */}
                            <IonItemGroup>
                                <IonItemDivider
                                    style={{
                                        "--color": "#000",
                                        fontWeight: "bold",
                                        "--background": "#fff",
                                    }}
                                >
                                    Profile Selection
                                </IonItemDivider>

                                <IonRow>
                                    <IonCol>
                                        <IonItem lines="none" style={{ "--background": "#fff", position: 'relative' }}>
                                            <IonInput
                                                className='ion-margin'
                                                label="Search Profile Name"
                                                labelPlacement="floating"
                                                fill="outline"
                                                placeholder="Type name to search..."
                                                value={form.profileSearch}
                                                onIonInput={(event) => handleProfileSearch(event.detail.value ?? '')}
                                                disabled={save || showEmptyProfilesMessage}
                                                style={{ "--color": "#000" }}
                                            />
                                        </IonItem>
                                        
                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && (
                                            <div style={{
                                                position: 'relative',
                                                zIndex: 1000,
                                                backgroundColor: '#fff',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                marginLeft: '16px',
                                                marginRight: '16px',
                                            }}>
                                                {filteredProfiles.map((profile) => (
                                                    <div
                                                        key={profile.profileid}
                                                        onClick={() => handleProfileSelect(profile)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #eee',
                                                            color: '#000'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                                    >
                                                        {profile.lastName ?? 'Unknown'}, {profile.firstName ?? 'Unknown'} (ID: {profile.profileid})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </IonCol>
                                </IonRow>
                            </IonItemGroup>

                            {/* PREGNANCY INFORMATION */}
                            <IonItemGroup>
                                <IonItemDivider
                                    style={{
                                        "--color": "#000",
                                        fontWeight: "bold",
                                        "--background": "#fff",
                                        marginTop: "10px",
                                    }}
                                >
                                    Pregnancy Information
                                </IonItemDivider>
                                <IonGrid>
                                    <IonRow>
                                        <IonCol size='12' size-md='6'>
                                            <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent' }}>
                                                <IonSelect
                                                    className='ion-margin'
                                                    label="Pregnancy Status"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    value={form.pregnancy_status}
                                                    onIonChange={(e) => handleChange('pregnancy_status', e.detail.value)}
                                                    style={{ "--color": "#000" }}
                                                    disabled={save}
                                                >
                                                    <IonSelectOption value="Pregnant">Pregnant</IonSelectOption>
                                                    <IonSelectOption value="Not Pregnant">Not Pregnant</IonSelectOption>
                                                </IonSelect>
                                            </IonItem>
                                        </IonCol>

                                        <IonCol size='12' size-md='6'>
                                            <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent' }}>
                                                <IonSelect
                                                    className='ion-margin'
                                                    label="Stage of Pregnancy"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    value={form.stage_of_pregnancy}
                                                    onIonChange={(e) => handleChange('stage_of_pregnancy', e.detail.value
                                                    )}
                                                    style={{ "--color": "#000" }}
                                                    disabled={save || form.pregnancy_status !== 'Pregnant'}
                                                >
                                                    <IonSelectOption value="First Trimester (1-12 weeks)">First Trimester (1-12 weeks)</IonSelectOption>
                                                    <IonSelectOption value="Second Trimester (13-26 weeks)">Second Trimester (13-26 weeks)</IonSelectOption>
                                                    <IonSelectOption value="Third Trimester (27-40 weeks)">Third Trimester (27-40 weeks)</IonSelectOption>
                                                    <IonSelectOption value="N/A">N/A</IonSelectOption>
                                                </IonSelect>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                                <IonGrid>
                                    <IonRow>
                                        <IonCol size='12' size-md='6'>
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonInput
                                                    className='ion-margin'
                                                    label="Number of Pregnancies"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    type="number"
                                                    value={form.num_of_pregnancies}
                                                    onIonInput={(e) => handleChange('num_of_pregnancies', parseInt(e.detail.value ?? ''))}
                                                    style={{ "--color": "#000" }}
                                                    disabled={save}
                                                />
                                            </IonItem>
                                        </IonCol>

                                        <IonCol size='12' size-md='6'>
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonInput
                                                    className='ion-margin'
                                                    label="Date of Last Menstrual Period"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    type="date"
                                                    value={form.date_of_last_mens_period}
                                                    onIonInput={(e) => handleChange('date_of_last_mens_period', e.detail.value ?? '')}
                                                    style={{ "--color": "#000" }}
                                                    disabled={save}
                                                />
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            </IonItemGroup>

                            {/* MEDICAL HISTORY */}
                            <IonItemGroup>
                                <IonItemDivider
                                    style={{
                                        "--color": "#000",
                                        fontWeight: "bold",
                                        "--background": "#fff",
                                    }}
                                >
                                    Medical History
                                </IonItemDivider>

                                <IonGrid>
                                    <IonRow>
                                        {medicalConditions.map((condition) => (
                                            <IonCol size='12' size-md='6' key={condition}>
                                                <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000" }}>
                                                    <IonCheckbox
                                                        checked={form.medical_history.includes(condition)}
                                                        onIonChange={(e) => handleCheckboxChange(condition, e.detail.checked, 'medical_history')}
                                                        disabled={save}
                                                        labelPlacement="end"
                                                    >
                                                        {condition}
                                                    </IonCheckbox>
                                                </IonItem>
                                            </IonCol>
                                        ))}
                                    </IonRow>
                                </IonGrid>

                                {/* Others input field */}
                                <IonRow>
                                    <IonCol>
                                        <IonItem lines="none" style={{ "--background": "#fff" }}>
                                            <IonLabel position="stacked" style={{ color: "#000", fontWeight: "bold", fontSize: "0.9rem" }}>
                                                Others (Specify)
                                            </IonLabel>
                                            <IonInput
                                                className='ion-margin'
                                                style={{ "--color": "#000" }}
                                                value={form.medical_history_others}
                                                onIonInput={(e) => handleChange('medical_history_others', e.detail.value ?? '')}
                                                placeholder="Specify other medical conditions"
                                                disabled={save}
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonItemGroup>

                            {/* VACCINATION/IMMUNIZATION */}
                            <IonItemGroup>
                                <IonItemDivider
                                    style={{
                                        "--color": "#000",
                                        fontWeight: "bold",
                                        "--background": "#fff",
                                    }}
                                >
                                    Vaccination/Immunization
                                </IonItemDivider>

                                <IonRow>
                                    <IonCol>
                                        <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000" }}>
                                            <IonCheckbox
                                                checked={form.tentanus_vacc}
                                                onIonChange={(e) => {
                                                    handleChange('tentanus_vacc', e.detail.checked);
                                                    // Reset tetanus_dose to 0 when unchecked
                                                    if (!e.detail.checked) {
                                                        handleChange('tetanus_dose', 0);
                                                    }
                                                }}
                                                disabled={save}
                                                labelPlacement="end"
                                            >
                                                Tetanus Vaccination Received
                                            </IonCheckbox>
                                        </IonItem>
                                    </IonCol>
                                </IonRow>

                                <IonRow>
                                    <IonCol>
                                        <IonItem lines="none" style={{ "--background": "#fff" }}>
                                            <IonInput
                                                className='ion-margin'
                                                label="Tetanus Dose"
                                                labelPlacement="floating"
                                                fill="outline"
                                                type="number"
                                                value={form.tetanus_dose}
                                                onIonInput={(e) => handleChange('tetanus_dose', parseInt(e.detail.value ?? '0'))}
                                                style={{ "--color": "#000" }}
                                                disabled={save || !form.tentanus_vacc}
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonItemGroup>

                            {/* VITAL SIGNS */}
                            <IonItemGroup>
                                <IonItemDivider
                                    style={{
                                        "--color": "#000",
                                        fontWeight: "bold",
                                        "--background": "#fff",
                                    }}
                                >
                                    Vital Signs
                                </IonItemDivider>
                                    <IonGrid>
                                        <IonRow>
                                            <IonCol size='12' size-md='6'>
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonInput
                                                        className='ion-margin'
                                                        label="Height (cm)"
                                                        labelPlacement="floating"
                                                        fill="outline"
                                                        type="number"
                                                        value={form.height}
                                                        onIonInput={(e) => handleChange('height', parseFloat(e.detail.value ?? '0'))}
                                                        style={{ "--color": "#000" }}
                                                        disabled={save}
                                                    />
                                                </IonItem>
                                            </IonCol>

                                            <IonCol size='12' size-md='6'>
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonInput
                                                        className='ion-margin'
                                                        label="Weight (kg)"
                                                        labelPlacement="floating"
                                                        fill="outline"
                                                        type="number"
                                                        value={form.weight}
                                                        onIonInput={(e) => handleChange('weight', parseFloat(e.detail.value ?? '0'))}
                                                        style={{ "--color": "#000" }}
                                                        disabled={save}
                                                    />
                                                </IonItem>
                                            </IonCol>

                                            <IonCol size='12' size-md='6'>
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonInput
                                                        className='ion-margin'
                                                        label="Temperature (°C)"
                                                        labelPlacement="floating"
                                                        fill="outline"
                                                        type="number"
                                                        value={form.temperature}
                                                        onIonInput={(e) => handleChange('temperature', parseFloat(e.detail.value ?? '0'))}
                                                        style={{ "--color": "#000" }}
                                                        disabled={save}
                                                    />
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>
                            </IonItemGroup>

                            {/* BUTTONS */}
                            <IonRow className="ion-justify-content-center ion-margin-top">
                                <IonCol size="auto">
                                    <IonButton 
                                        color="primary" 
                                        onClick={handleSave}
                                        disabled={save || loading || showEmptyProfilesMessage || prefillLoading}
                                    >
                                        {save ? <IonSpinner name="lines-small" /> : (isEditing ? 'Update' : 'Save')}
                                    </IonButton>
                                </IonCol>
                                <IonCol size="auto">
                                    <IonButton color="medium" fill="outline" onClick={onClose} disabled={save}>
                                        Cancel
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                            
                            {error && (
                                <IonRow>
                                    <IonCol>
                                        <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
                                            {error}
                                        </div>
                                    </IonCol>
                                </IonRow>
                            )}
                        
                        </IonCardContent>
                    </IonCard>
                )}
            </IonContent>
        </IonModal>
    ); 
};

export default AddHealthRecord;
import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonModal, IonPage, IonRadio, IonRadioGroup, IonRow, IonSelect, IonSelectOption, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { filter, save } from 'ionicons/icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../utils/supabaseClients';
import CaseManagement from '../pages/admin/Tabs/CaseManagement';

interface AddCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (caseData: any) => Promise<void>;
    editingCase?: any | null;
    isEditing?: boolean;
}

interface ProfileOption {
    profileid: number;
    firstName: string | null;
    lastName: string | null;
}

interface FormState {
    profileid: number | null;
    profileSearch: string;
    case_created_by: string;
    guid_received_from: string;
    guidance_type: string;
    guidance_frequency: string;
    fam_sup_received_from: string;
    family_support_type: string;
    family_support_frequency: string;
    received_GC: string;
    received_FS: string;
}

const emptyForm: FormState= {
    profileid: null,
    profileSearch: '',
    case_created_by: '',
    guid_received_from: '',
    guidance_type: '',
    guidance_frequency: '',
    fam_sup_received_from: '',
    family_support_type: '',
    family_support_frequency: '',
    received_GC: '',
    received_FS: '',
}
const AddCaseModal: React.FC<AddCaseModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    editingCase = null,
    isEditing = false 
}) => {

        
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [form, setForm] = useState<FormState>(emptyForm);
        const [saved, setSaved] = useState(false);
        const [profile, setProfile] = useState<ProfileOption[]>([]);
        const [profileLoading, setProfileLoading] = useState(false);
        const [filterProfile, setFilterProfile] = useState<ProfileOption[]>([]);
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [currentUserName, setCurrentUserName] = useState<string>('');
        const [prefillLoading, setPrefillLoading] = useState(false);
        const isLoadingEditData = useRef(false);

       useEffect(() =>{
            if (!isOpen) {
                return;
            }
            
            if (isEditing && editingCase) {
                // Load editing data
                loadEditingData();
            } else {
                // Reset form for new record
                setForm(emptyForm);
                void loadCurrentUser();
            }
            
            setError(null);
            void loadProfiles();
        }, [isOpen, isEditing, editingCase]);

        const loadEditingData = async () => {
            if (!editingCase) return;
            
            isLoadingEditData.current = true;
            setPrefillLoading(true);
            try {
                // Load profile data for the search field
                const { data: profileData, error: profileError } = await supabase
                    .from('profile')
                    .select('profileid, firstName, lastName')
                    .eq('profileid', editingCase.profileid)
                    .single();

                if (profileError) throw profileError;

                const profileSearchText = profileData 
                    ? `${profileData.lastName ?? ''}, ${profileData.firstName ?? ''} (ID: ${profileData.profileid})`
                    : '';

                isLoadingEditData.current = false;
                
                // Set form with editing data
                setForm({
                    profileid: editingCase.profileid,
                    profileSearch: profileSearchText,
                    case_created_by: editingCase.case_created_by || '',
                    guid_received_from: editingCase.guid_received_from || '',
                    guidance_type: editingCase.guidance_type || '',
                    guidance_frequency: editingCase.guidance_frequency || '',
                    fam_sup_received_from: editingCase.fam_sup_received_from || '',
                    family_support_type: editingCase.family_support_type || '',
                    family_support_frequency: editingCase.family_support_frequency || '',
                    received_GC: editingCase.received_GC || '',
                    received_FS: editingCase.received_FS || '',
                });
                
            } catch (err) {
                console.error('Error loading editing data:', err);
                setError('Failed to load case record data');
                isLoadingEditData.current = false;
            } finally {
                setPrefillLoading(false);
            }
        };

        const loadCurrentUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user?.id) {
                    
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('userfirstName, userlastName')
                        .eq('auth_id', session.user.id)
                        .single();

                        
                    if (userError) {
                        console.error('Error fetching user data:', userError);
                    } else if (userData) {
                        const fullName = `${userData.userfirstName || ''} ${userData.userlastName || ''}`.trim();
                        
                        setCurrentUserName(fullName);
                        setForm((prevForm) => ({
                            ...prevForm,
                            case_created_by: fullName
                        }));
                    }
                }
            } catch (error) {
                console.error('Error loading current user:', error);
            }
        };

        const handleProfileSearch = (searchValue: string) => {
            setForm((prevForm) => ({
                ...prevForm,
                profileSearch: searchValue,
                profileid: null
            }));

            if (searchValue.trim() === '') {
                setFilterProfile([]);
                setShowSuggestions(false);
                return;
            }

            const filtered = profile.filter((profile) => {
                const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.toLowerCase();
                return fullName.includes(searchValue.toLowerCase());
            });
            setFilterProfile(filtered);
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
                        setProfile(data ?? []);
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

        const handleProfileSelect = async (profile: ProfileOption) => {
        
        setError(null);

        setForm((prevForm) => ({
            ...prevForm,
            profileid: profile.profileid,
            profileSearch: `${profile.lastName ?? ''}, ${profile.firstName ?? ''} (ID: ${profile.profileid})`,
        }));
        setShowSuggestions(false);
            
    };

    const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prevForm) => ({
            ...prevForm,
            [key]: value,
        }));
    };

    const handleSave = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!form.profileid) {
            setError('Please select a profile.');
            return;
        }
        setSaved(true);
        setError(null);

        try {
            if (isEditing && editingCase) {
                // Update existing record
                const payload = {
                    profileid: form.profileid,
                    case_created_by: form.case_created_by || null,
                    guid_received_from: form.guid_received_from || null,
                    guidance_type: form.guidance_type || null,
                    guidance_frequency: form.guidance_frequency || null,
                    fam_sup_received_from: form.fam_sup_received_from || null,
                    family_support_type: form.family_support_type || null,
                    family_support_frequency: form.family_support_frequency || null,
                    received_GC: form.received_GC || null,
                    received_FS: form.received_FS || null,
                };

                const { error } = await supabase
                    .from('caseManagement')
                    .update(payload)
                    .eq('caseid', editingCase.caseid);

                if (error) throw error;

                await onSave({ ...payload, caseid: editingCase.caseid });
                setForm(emptyForm);
                onClose();
            } else {
                // Create new record
                const currentYear = new Date().getFullYear();
                const yearPrefix = parseInt(currentYear.toString());

                const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
                const newCaseId = parseInt(`${yearPrefix}${randomSuffix}`);

                const payLoad = {
                    caseid: newCaseId,
                    profileid: form.profileid,
                    case_created_by: form.case_created_by || null,
                    guid_received_from: form.guid_received_from || null,
                    guidance_type: form.guidance_type || null,
                    guidance_frequency: form.guidance_frequency || null,
                    fam_sup_received_from: form.fam_sup_received_from || null,
                    family_support_type: form.family_support_type || null,
                    family_support_frequency: form.family_support_frequency || null,
                    received_GC: form.received_GC || null,
                    received_FS: form.received_FS || null,
                };

                const { error } = await supabase
                    .from('caseManagement')
                    .insert(payLoad);

                if (error) {
                    if (error.code === '23505') {
                        setError('A case with this ID already exists. Please try again.');
                    } else {
                        setError(error.message);
                    }
                } else {
                    await onSave(payLoad);
                    setForm(emptyForm);
                    onClose();
                }
            }
        } catch (error: any) {
            setError(error.message || 'An error occurred while saving');
        } finally {
            setSaved(false);
        }
    };

    const showEmptyProfilesMessage = useMemo(
            () => !loading && profile.length === 0,
            [loading, profile.length],
        );

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
                        {isEditing ? 'Edit Case Record' : 'Add Case Record'}
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
            <IonContent style={{ '--background': '#ffffffff' }}>
                {loading || prefillLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <IonSpinner />
                    </div>
                ) : (
                    <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff" }}>
                        <IonCardContent style={{"--background": "#fff",}}>
                            

                                {error && (
                                <IonText color="danger" style={{ display: "block", marginBottom: "1rem" }}>
                                    {error}
                                </IonText>
                                )}

                                {/* Profile Selector */}
                                <IonItemGroup>
                                    <IonItemDivider
                                        className='ion-margin-top'
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
                                            <IonItem style={{ "--background": "#fff", "--color": "#000000", '--background-hover':'#fff', '--background-focused':'transparent','--background-activated':'#fff', position: 'relative' }}>
                                                <IonLabel position="stacked" style={{ '--color': '#000000' }}>
                                                    Name <IonText color="danger">*</IonText>
                                                </IonLabel>
                                                <IonInput
                                                    placeholder="Search by name..."
                                                    value={form.profileSearch}
                                                    onIonInput={(event) => handleProfileSearch(event.detail.value ?? '')}
                                                    disabled={saved || showEmptyProfilesMessage || profileLoading}
                                                    style={{ '--color': '#000000' }}
                                                />
                                                {profileLoading && (
                                                    <IonSpinner slot="end" name="dots" style={{ transform: 'translateY(6px)' }} />
                                                )}
                                            </IonItem>

                                            {/* Suggestions Dropdown */}
                                            {showSuggestions && (
                                                <div style={{
                                                    position: 'relative',
                                                    zIndex: 1000,
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '2px',
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    marginTop: '-10px',
                                                    
                                                    
                                                }}>
                                                    {filterProfile.map((profile) => (
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

                                <IonRow>
                                    <IonCol size='12' sizeMd='6'>
                                        
                                        <IonItemGroup>
                                            {/*Guidance Counseling*/ }
                                            <IonItemDivider
                                                className='ion-margin-top'
                                                style={{
                                                    "--color": "#000",
                                                    fontWeight: "bold",
                                                    "--background": "#fff",
                                                }}
                                            >
                                                Guidance Counciling
                                            </IonItemDivider>

                                            <IonItem lines='none' style={{ "--background": "#fff", "--color": "#000" }}>
                                                <IonLabel position="stacked" style={{ '--color': '#000000' }}>
                                                    Guidance Received?
                                                </IonLabel>

                                                <IonRadioGroup
                                                    
                                                    className='ion-margin-top'
                                                    value={form.received_GC}
                                                    onIonChange={(e) =>{
                                                        handleChange('received_GC', e.detail.value);
                                                        if (e.detail.value === 'No') {
                                                            handleChange('guidance_type','');
                                                            handleChange('guid_received_from','');
                                                            handleChange('guidance_frequency','');
                                                        }
                                                    }}
                                                >
                                                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000" }}>
                                                        <IonRadio value='Yes' labelPlacement='end'>Yes</IonRadio>
                                                    </IonItem>
                                                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000" }}>
                                                        <IonRadio value='No' labelPlacement='end'>No</IonRadio>
                                                    </IonItem>

                                                </IonRadioGroup>
                                            </IonItem>

                                            {/* Type of Service */}
                                            <IonItem lines='none' style={{ "--background": "#fff", "--color": "#000" }}>
                                                <IonInput
                                                    className='ion-margin'
                                                    label="Type of Guidance"
                                                    fill='outline'
                                                    type="text"
                                                    labelPlacement="floating"
                                                    value={form.guidance_type}
                                                    onIonInput={(event) => handleChange('guidance_type', event.detail.value ?? '')}
                                                    disabled={saved || form.received_GC !== 'Yes'}
                                                />
                                            </IonItem>

                                            {/* recieved From Whom */}
                                            <IonItem lines='none' style={{ "--background": "#fff", "--color": "#000" }}>
                                                <IonInput
                                                    className='ion-margin'
                                                    label="Received From Whom?"
                                                    fill='outline'
                                                    type="text"
                                                    labelPlacement="floating"
                                                    value={form.guid_received_from}
                                                    onIonInput={(event) => handleChange('guid_received_from', event.detail.value ?? '')}
                                                    disabled={saved || form.received_GC !== 'Yes'}
                                                />
                                            </IonItem>

                                            {/* Frequency of Service */}
                                            <IonItem lines='none' style={{ "--background": "#fff", "--color": "#000" }}>
                                                <IonSelect
                                                    className='ion-margin'
                                                    label="How Frequent?"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    value={form.guidance_frequency}
                                                    style={{ "--color": "#000" }}
                                                    onIonChange={(e) => handleChange("guidance_frequency", e.detail.value)}
                                                    disabled={saved || form.received_GC !== 'Yes'}
                                                >
                                                    <IonSelectOption value="Weekly">Weekly</IonSelectOption>
                                                    <IonSelectOption value="Monthly">Monthly</IonSelectOption>
                                                    <IonSelectOption value="Quarterly">Quarterly</IonSelectOption>
                                                    <IonSelectOption value="Annually">Annually</IonSelectOption>
                                                </IonSelect>
                                            </IonItem>
                                        </IonItemGroup>
                                    </IonCol>

                                    <IonCol size='12' sizeMd='6'>
                                        <IonItemGroup>
                                            {/*Family Support*/ }
                                            <IonItemDivider
                                                className='ion-margin-top'
                                                style={{
                                                    "--color": "#000",
                                                    fontWeight: "bold",
                                                    "--background": "#fff",
                                                }}
                                            >
                                                Family Support
                                            </IonItemDivider>

                                            <IonItem lines='none' style={{ "--background": "#fff", "--color": "#000" }}>
                                                <IonLabel position="stacked" style={{ '--color': '#000000' }}>
                                                    Family Support Received?
                                                </IonLabel>

                                                <IonRadioGroup
                                                    className='ion-margin-top'
                                                    value={form.received_FS}
                                                    onIonChange={(e) =>{
                                                        handleChange('received_FS', e.detail.value);
                                                        if (e.detail.value === 'No') {
                                                            handleChange('family_support_type','');
                                                            handleChange('fam_sup_received_from','');
                                                            handleChange('family_support_frequency','');
                                                        }
                                                    }}
                                                >
                                                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000" }}>
                                                        <IonRadio value='Yes' labelPlacement='end'>Yes</IonRadio>
                                                    </IonItem>
                                                    <IonItem lines="none" style={{ "--background": "#fff", "--color": "#000" }}>
                                                        <IonRadio value='No' labelPlacement='end'>No</IonRadio>
                                                    </IonItem>
                                                </IonRadioGroup>
                                            </IonItem>

                                            {/* Type of Service */}
                                    <IonItem lines="none" style={{ "--background": "#fff" }}>
                                        <IonInput
                                            className='ion-margin'
                                            label="Type of Support?"
                                            labelPlacement="floating"
                                            fill="outline"
                                            type="text"
                                            value={form.family_support_type}
                                            onIonInput={(event) => handleChange("family_support_type", event.detail.value ?? '')}
                                            style={{ '--color': '#000000' }}
                                            disabled={form.received_FS !== 'Yes'}
                                        />
                                    </IonItem>
                                    {/* recieved From Whom */}
                                    <IonItem lines="none" style={{ "--background": "#fff" }}>
                                        <IonInput
                                            className='ion-margin'
                                            label="Received From Whom?"
                                            labelPlacement="floating"
                                            fill="outline"
                                            type="text"
                                            value={form.fam_sup_received_from}
                                            onIonInput={(event) => handleChange("fam_sup_received_from", event.detail.value ?? '')}
                                            style={{ '--color': '#000000' }}
                                            disabled={form.received_FS !== 'Yes'}
                                        />
                                    </IonItem>

                                    {/* Frequency of Service */}
                                    <IonItem lines="none" style={{ "--background": "#fff" }}>
                                        <IonSelect
                                            className='ion-margin'
                                            fill="outline"
                                            label="How Frequent?"
                                            labelPlacement="floating"
                                            value={form.family_support_frequency}
                                            style={{ "--color": "#000" }}
                                            onIonChange={(e) => handleChange("family_support_frequency", e.detail.value)}
                                            disabled={form.received_FS !== 'Yes'}
                                        >
                                            <IonSelectOption value="Weekly">Weekly</IonSelectOption>
                                            <IonSelectOption value="Monthly">Monthly</IonSelectOption>
                                            <IonSelectOption value="Quarterly">Quarterly</IonSelectOption>
                                            <IonSelectOption value="Annually">Annually</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                        </IonItemGroup>
                                    </IonCol>
                                </IonRow>
                            

                        <IonRow className="ion-justify-content-center ion-margin-top" style={{ '--background': 'transparent' }}>
                            <IonCol size="auto">
                                <IonButton
                                    expand="block"
                                    onClick={handleSave}
                                    style={{ '--background': '#002d54', color: '#fff' }}
                                    disabled={saved || loading || showEmptyProfilesMessage || profileLoading || prefillLoading}
                                >
                                    {saved ? <IonSpinner name="lines-small" /> : (isEditing ? 'Update' : 'Save')}
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        </IonCardContent>
                    </IonCard>
                )}
            </IonContent>
        </IonModal>
    );
};

export default AddCaseModal;
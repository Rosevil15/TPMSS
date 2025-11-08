import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonModal, IonPage, IonRadio, IonRadioGroup, IonRow, IonSelect, IonSelectOption, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
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
    received_SS: string;
    social_support_type: string;
    social_sup_received_from: string;
    social_sup_frequency: string;
    received_PS: string;
    partner_support_type: string;
    partner_support_frequency: string;
}

const emptyForm: FormState = {
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
    received_SS: '',
    social_support_type: '',
    social_sup_received_from: '',
    social_sup_frequency: '',
    received_PS: '',
    partner_support_type: '',
    partner_support_frequency: '',
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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const isLoadingEditData = useRef(false);

    useEffect(() => {
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
                received_SS: editingCase.received_SS || '',
                social_support_type: editingCase.social_support_type || '',
                social_sup_received_from: editingCase.social_sup_received_from || '',
                social_sup_frequency: editingCase.social_sup_frequency || '',
                received_PS: editingCase.received_PS || '',
                partner_support_type: editingCase.partner_support_type || '',
                partner_support_frequency: editingCase.partner_support_frequency || '',
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
            const { data, error } = await supabase
                .from('profile')
                .select('profileid,firstName,lastName')
                .order('lastName', { ascending: true });

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
        setFilterProfile([]);
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
                    received_SS: form.received_SS || null,
                    social_support_type: form.social_support_type || null,
                    social_sup_received_from: form.social_sup_received_from || null,
                    social_sup_frequency: form.social_sup_frequency || null,
                    received_PS: form.received_PS || null,
                    partner_support_type: form.partner_support_type || null,
                    partner_support_frequency: form.partner_support_frequency || null,
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
                    received_SS: form.received_SS || null,
                    social_support_type: form.social_support_type || null,
                    social_sup_received_from: form.social_sup_received_from || null,
                    social_sup_frequency: form.social_sup_frequency || null,
                    received_PS: form.received_PS || null,
                    partner_support_type: form.partner_support_type || null,
                    partner_support_frequency: form.partner_support_frequency || null,
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
        <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{ '--width': '100%', '--height': '100%' }}>
            <IonHeader>
                <IonToolbar
                    style={{
                        '--background': '#002d54',
                        color: '#fff',
                    }}
                >
                    <IonTitle style={{ fontWeight: 'bold' }}>
                        {isEditing ? 'Edit Case Record' : 'Add Case Record'}
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

            <IonContent className="ion-padding" style={{ '--background': '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <IonCard style={{ borderRadius: '15px', boxShadow: '0 0 10px #ccc', '--background': '#fff', width: isMobile ? '100%' : '90%', margin: 'auto' }}>
                    <IonCardContent>
                        <h2 style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#fff', padding: '10px', fontSize: isMobile ? '1.3rem' : '2rem', textAlign: 'center' }}>
                            {isEditing ? 'Edit Case Management Record' : 'Case Management Form'}
                        </h2>

                        {/* PROFILE SELECTION */}
                        <IonItemGroup>
                            <IonItemDivider
                                style={{
                                    '--color': '#000',
                                    fontWeight: 'bold',
                                    '--background': '#fff',
                                }}
                            >
                                Profile Selection
                            </IonItemDivider>

                            <IonRow>
                                <IonCol>
                                    <IonItem lines="none" style={{ '--background': '#fff', position: 'relative' }}>
                                        <IonInput
                                            className="ion-margin"
                                            label="Search Profile"
                                            labelPlacement="floating"
                                            fill="outline"
                                            placeholder="Type name to search..."
                                            value={form.profileSearch}
                                            onIonInput={(event) => handleProfileSearch(event.detail.value ?? '')}
                                            disabled={saved || showEmptyProfilesMessage || profileLoading}
                                            style={{ '--color': '#000' }}
                                        />
                                    </IonItem>

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && (
                                        <div
                                            style={{
                                                position: 'relative',
                                                zIndex: 1000,
                                                backgroundColor: '#fff',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                marginLeft: '16px',
                                                marginRight: '16px',
                                            }}
                                        >
                                            {filterProfile.map((profile) => (
                                                <div
                                                    key={profile.profileid}
                                                    onClick={() => handleProfileSelect(profile)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee',
                                                        color: '#000',
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                                                >
                                                    {profile.lastName ?? 'Unknown'}, {profile.firstName ?? 'Unknown'} (ID: {profile.profileid})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </IonCol>
                            </IonRow>
                        </IonItemGroup>

                        <IonGrid>
                            <IonRow>
                                {/* GUIDANCE AND COUNSELING SECTION */}
                                <IonCol size="12" size-md="6">                                  
                                    <IonItemGroup>
                                        <IonItemDivider
                                            style={{
                                                '--color': '#000',
                                                fontWeight: 'bold',
                                                '--background': '#fff',
                                                marginTop: '10px',
                                            }}
                                        >
                                            Guidance and Counseling
                                        </IonItemDivider>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonLabel position="stacked" style={{ '--color': '#000000' }}>
                                                Guidance and Counseling Received?
                                            </IonLabel>
                                            <IonRadioGroup
                                                className="ion-margin-top"
                                                value={form.received_GC}
                                                onIonChange={(e) => {
                                                    handleChange('received_GC', e.detail.value);
                                                    if (e.detail.value === 'No') {
                                                        handleChange('guidance_type', '');
                                                        handleChange('guid_received_from', '');
                                                        handleChange('guidance_frequency', '');
                                                    }
                                                }}
                                            >
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="Yes" labelPlacement="end">Yes</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="No" labelPlacement="end">No</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="In Need" labelPlacement="end">In Need</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                            </IonRadioGroup>
                                        </IonItem>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Type of Guidance"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.guidance_type}
                                                onIonInput={(event) => handleChange('guidance_type', event.detail.value ?? '')}
                                                disabled={saved || form.received_GC !== 'Yes'}
                                                style={{ '--color': '#000' }}
                                            />
                                        </IonItem>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Received From Whom?"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.guid_received_from}
                                                onIonInput={(event) => handleChange('guid_received_from', event.detail.value ?? '')}
                                                disabled={saved || form.received_GC !== 'Yes'}
                                                style={{ '--color': '#000' }}
                                            />
                                        </IonItem>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonSelect
                                                className="ion-margin"
                                                label="How Frequent?"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.guidance_frequency}
                                                onIonChange={(e) => handleChange('guidance_frequency', e.detail.value)}
                                                disabled={saved || form.received_GC !== 'Yes'}
                                                style={{ '--color': '#000' }}
                                            >
                                                <IonSelectOption value="Weekly">Weekly</IonSelectOption>
                                                <IonSelectOption value="Monthly">Monthly</IonSelectOption>
                                                <IonSelectOption value="Quarterly">Quarterly</IonSelectOption>
                                                <IonSelectOption value="Annually">Annually</IonSelectOption>
                                            </IonSelect>
                                        </IonItem>
                                    </IonItemGroup>
                                </IonCol>

                                {/* FAMILY SUPPORT SECTION */}
                                <IonCol size="12" size-md="6">   
                                    <IonItemGroup>
                                        <IonItemDivider
                                            style={{
                                                '--color': '#000',
                                                fontWeight: 'bold',
                                                '--background': '#fff',
                                                marginTop: '10px',
                                            }}
                                        >
                                            Family Support
                                        </IonItemDivider>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonLabel position="stacked" style={{ '--color': '#000000' }}>
                                                Family Support Received?
                                            </IonLabel>
                                            <IonRadioGroup
                                                className="ion-margin-top"
                                                value={form.received_FS}
                                                onIonChange={(e) => {
                                                    handleChange('received_FS', e.detail.value);
                                                    if (e.detail.value === 'No') {
                                                        handleChange('family_support_type', '');
                                                        handleChange('fam_sup_received_from', '');
                                                        handleChange('family_support_frequency', '');
                                                    }
                                                }}
                                            >
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="Yes" labelPlacement="end">Yes</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="No" labelPlacement="end">No</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="In Need" labelPlacement="end">In Need</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                            </IonRadioGroup>
                                        </IonItem>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Type of Support?"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.family_support_type}
                                                onIonInput={(event) => handleChange('family_support_type', event.detail.value ?? '')}
                                                disabled={saved || form.received_FS !== 'Yes'}
                                                style={{ '--color': '#000' }}
                                            />
                                        </IonItem>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Received From Whom?"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.fam_sup_received_from}
                                                onIonInput={(event) => handleChange('fam_sup_received_from', event.detail.value ?? '')}
                                                disabled={saved || form.received_FS !== 'Yes'}
                                                style={{ '--color': '#000' }}
                                            />
                                        </IonItem>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonSelect
                                                className="ion-margin"
                                                label="Frequency of Support?"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.family_support_frequency}
                                                onIonChange={(e) => handleChange('family_support_frequency', e.detail.value)}
                                                disabled={saved || form.received_FS !== 'Yes'}
                                                style={{ '--color': '#000' }}
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

                            <IonRow>
                                {/* Social SUPPORT SECTION */}
                                <IonCol size="12" size-md='6'>
                                    <IonItemGroup>
                                        <IonItemDivider
                                            style={{
                                                '--color': '#000',
                                                fontWeight: 'bold',
                                                '--background': '#fff',
                                                marginTop: '10px',
                                            }}
                                        >
                                            Social Support
                                        </IonItemDivider>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonLabel position='stacked' style={{ '--color': '#000000' }}>Social Support Received?</IonLabel>
                                            <IonRadioGroup
                                                className="ion-margin-top"
                                                value={form.received_SS}
                                                onIonChange={(e) =>  {
                                                    handleChange('received_SS', e.detail.value);
                                                    if (e.detail.value === 'No') {
                                                        handleChange('social_support_type', '');
                                                        handleChange('social_sup_received_from', '');
                                                        handleChange('social_sup_frequency', '');
                                                    }
                                                }}
                                                >
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="Yes" labelPlacement="end">Yes</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="No" labelPlacement="end">No</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                                <IonRow>
                                                    <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                        <IonRadio value="In Need" labelPlacement="end">In Need</IonRadio>
                                                    </IonItem>
                                                </IonRow>
                                            </IonRadioGroup>
                                        </IonItem>
                                    </IonItemGroup>

                                    <IonItem lines="none" style={{ '--background': '#fff' }}>
                                        <IonInput
                                            className="ion-margin"
                                            label="Type of Support?"
                                            labelPlacement="floating"
                                            fill="outline"
                                            value={form.social_support_type}
                                            onIonInput={(event) => handleChange('social_support_type', event.detail.value ?? '')}
                                            disabled={saved || form.received_SS !== 'Yes'}
                                            style={{ '--color': '#000' }}
                                        />
                                    </IonItem>

                                    <IonItem lines="none" style={{ '--background': '#fff' }}>
                                        <IonInput
                                            className="ion-margin"
                                            label="Received From Whom?"
                                            labelPlacement="floating"
                                            fill="outline"
                                            value={form.social_sup_received_from}
                                            onIonInput={(event) => handleChange('social_sup_received_from', event.detail.value ?? '')}
                                            disabled={saved || form.received_SS !== 'Yes'}
                                            style={{ '--color': '#000' }}
                                        />
                                    </IonItem>

                                    <IonItem lines="none" style={{ '--background': '#fff' }}>
                                        <IonSelect
                                            className="ion-margin"
                                            label="How Frequent?"
                                            labelPlacement="floating"
                                            fill="outline"
                                            value={form.social_sup_frequency}
                                            onIonChange={(e) => handleChange('social_sup_frequency', e.detail.value)}
                                            disabled={saved || form.received_SS !== 'Yes'}
                                            style={{ '--color': '#000' }}
                                        >
                                            <IonSelectOption value="Weekly">Weekly</IonSelectOption>
                                            <IonSelectOption value="Monthly">Monthly</IonSelectOption>
                                            <IonSelectOption value="Quarterly">Quarterly</IonSelectOption>
                                            <IonSelectOption value="Annually">Annually</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </IonCol>

                                {/* Partner's SUPPORT SECTION */}
                                <IonCol size="12" size-md='6'>
                                    <IonItemGroup>
                                        <IonItemDivider
                                            style={{
                                                '--color': '#000',
                                                fontWeight: 'bold',
                                                '--background': '#fff',
                                                marginTop: '10px',
                                            }}
                                        >
                                            Partner's Support
                                        </IonItemDivider>

                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonLabel position='stacked' style={{ '--color': '#000000' }}>Receiving Support From Your Partner?</IonLabel>
                                            <IonRadioGroup
                                                className="ion-margin-top"
                                                value={form.received_PS}
                                                onIonChange={(e) =>  {
                                                    handleChange('received_PS', e.detail.value);
                                                    if (e.detail.value === 'No') {
                                                        handleChange('partner_support_type', '');
                                                        handleChange('partner_support_frequency', '');
                                                    }
                                                }}
                                                >

                                                <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                    <IonRadio value="Yes" labelPlacement="end">Yes</IonRadio>
                                                </IonItem>
                                                <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                    <IonRadio value="No" labelPlacement="end">No</IonRadio>
                                                </IonItem>
                                            </IonRadioGroup>
                                        </IonItem>
                                    </IonItemGroup>

                                    <IonItem lines="none" style={{ '--background': '#fff' }}>
                                        <IonInput
                                            className="ion-margin"
                                            label="Type of Support?"
                                            labelPlacement="floating"
                                            fill="outline"
                                            value={form.partner_support_type}
                                            onIonInput={(event) => handleChange('partner_support_type', event.detail.value ?? '')}
                                            disabled={saved || form.received_PS !== 'Yes'}
                                            style={{ '--color': '#000' }}
                                        />
                                    </IonItem>

                                    <IonItem lines="none" style={{ '--background': '#fff' }}>
                                        <IonSelect
                                            className="ion-margin"
                                            label="Frequency of Support?"
                                            labelPlacement="floating"
                                            fill="outline"
                                            value={form.partner_support_frequency}
                                            onIonChange={(e) => handleChange('partner_support_frequency', e.detail.value)}
                                            disabled={saved || form.received_PS !== 'Yes'}
                                            style={{ '--color': '#000' }}
                                        >
                                            <IonSelectOption value="Always">Always</IonSelectOption>
                                            <IonSelectOption value="Sometimes">Sometimes</IonSelectOption>
                                            <IonSelectOption value="Seldum">Seldum</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </IonCol>
                            </IonRow>
                        </IonGrid>

                        {/* BUTTONS */}
                        <IonRow className="ion-justify-content-center ion-margin-top">
                            <IonCol size="auto">
                                <IonButton 
                                    color="primary" 
                                    onClick={handleSave} 
                                    disabled={saved || loading || showEmptyProfilesMessage || profileLoading || prefillLoading}
                                >
                                    {saved ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
                                </IonButton>
                            </IonCol>
                            <IonCol size="auto">
                                <IonButton 
                                    color="medium" 
                                    fill="outline" 
                                    onClick={onClose} 
                                    disabled={saved}
                                >
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
            </IonContent>
        </IonModal>
    );
};

export default AddCaseModal;
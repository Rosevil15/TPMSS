import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../utils/supabaseClients';
import { search } from 'ionicons/icons';

interface EducationRecordProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: any) => Promise<void>;
    editingEducation?: any | null;
    isEditing?: boolean;
}

interface ProfileOption {
    profileid: number;
    firstName: string | null;
    lastName: string | null;
}

interface formState {
    profileid: number | null;
    typeOfProgram: string;
    profileSearch: string;
    programCourse: string;
    status: string;
    institutionOrCenter: string;
    enroll_dropout_Date: string;
    gradeLevel: string;
}

const emptyForm: formState = {
    profileid: null,
    typeOfProgram: '',
    profileSearch: '',
    programCourse: '',
    status: '',
    institutionOrCenter: '',
    enroll_dropout_Date: '',
    gradeLevel: '',
};

const AddEnrollRecordModal: React.FC<EducationRecordProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    editingEducation = null,
    isEditing = false 
}) => {
    const [profiles, setProfiles] = useState<ProfileOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [save, setSave] = useState(false);
    const [prefillLoading, setPrefillLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<formState>(emptyForm);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredProfiles, setFilteredProfiles] = useState<ProfileOption[]>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const isLoadingEditData = useRef(false);
    const previousTypeOfProgram = useRef<string>('');

    const gradeLevelOptions: Record<string, string[]> = {
        'elementary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
        'junior high': ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        'senior high': ['Grade 11', 'Grade 12'],
        'college': ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    };

    const getGradeLevelOptions = () => {
        const programType = form.typeOfProgram.toLowerCase();
        return gradeLevelOptions[programType] || [];
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        
        if (isEditing && editingEducation) {
            // Load editing data
            loadEditingData();
        } else {
            // Reset form for new record
            setForm(emptyForm);
            previousTypeOfProgram.current = '';
        }
        
        setError(null);
        void loadProfiles();
    }, [isOpen, isEditing, editingEducation]);

    useEffect(() => {
        if (!isLoadingEditData.current && 
            previousTypeOfProgram.current !== '' && 
            previousTypeOfProgram.current !== form.typeOfProgram) {
            setForm((prevForm) => ({
                ...prevForm,
                gradeLevel: '',
            }));
        }
        previousTypeOfProgram.current = form.typeOfProgram;
    }, [form.typeOfProgram]);

    const loadEditingData = async () => {
        if (!editingEducation) return;
        
        isLoadingEditData.current = true;
        setPrefillLoading(true);
        try {
            // Load profile data for the search field
            const { data: profileData, error: profileError } = await supabase
                .from('profile')
                .select('profileid, firstName, lastName')
                .eq('profileid', editingEducation.profileid)
                .single();

            if (profileError) throw profileError;

            const profileSearchText = profileData 
                ? `${profileData.lastName ?? ''}, ${profileData.firstName ?? ''} (ID: ${profileData.profileid})`
                : '';

            // IMPORTANT: Set the previous type BEFORE setting the form
            previousTypeOfProgram.current = editingEducation.typeOfProgram || '';

            isLoadingEditData.current = false;
            // Set form with editing data
            setForm({
                profileid: editingEducation.profileid,
                profileSearch: profileSearchText,
                typeOfProgram: editingEducation.typeOfProgram || '',
                programCourse: editingEducation.programCourse || '',
                status: editingEducation.status || '',
                institutionOrCenter: editingEducation.institutionOrCenter || '',
                enroll_dropout_Date: editingEducation.enroll_dropout_Date || '',
                gradeLevel: editingEducation.gradeLevel || '',
            });
            
        } catch (err) {
            console.error('Error loading editing data:', err);
            setError('Failed to load education record data');
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
            const { data, error } = await supabase
                .from('profile')
                .select('profileid,firstName,lastName')
                .order('lastName', { ascending: true });

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

    const handleProfileSelect = async (profile: ProfileOption) => {
        setError(null);
        setForm((prevForm) => ({
            ...prevForm,
            profileid: profile.profileid,
            profileSearch: `${profile.lastName ?? ''}, ${profile.firstName ?? ''} (ID: ${profile.profileid})`,
        }));
        setShowSuggestions(false);
        setFilteredProfiles([]);
    };

    const handleChange = <K extends keyof formState>(key: K, value: formState[K]) => {
        setForm((prevForm) => ({
            ...prevForm,
            [key]: value,
        }));
    };

    const handleSave = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!form.profileid) {
            setError('Please select a profile');
            return;
        }
        setSave(true);
        setError(null);

        try {
            if (isEditing && editingEducation) {
                // Update existing record
                const payload = {
                    profileid: form.profileid,
                    typeOfProgram: form.typeOfProgram || null,
                    programCourse: form.programCourse || null,
                    status: form.status || null,
                    institutionOrCenter: form.institutionOrCenter || null,
                    enroll_dropout_Date: form.enroll_dropout_Date || null,
                    gradeLevel: form.gradeLevel || null,
                };

                const { error } = await supabase
                    .from('EducationAndTraining')
                    .update(payload)
                    .eq('educationid', editingEducation.educationid);

                if (error) throw error;

                await onSave({ ...payload, educationid: editingEducation.educationid });
                setForm(emptyForm);
            } else {
                // Create new record
                const currentYear = new Date().getFullYear();
                const yearPrefix = parseInt(currentYear.toString());

                const { count, error: countError } = await supabase
                    .from('EducationAndTraining')
                    .select('*', { count: 'exact', head: true })
                    .gte('educationid', yearPrefix * 10000)
                    .lt('educationid', (yearPrefix + 1) * 10000);

                if (countError) {
                    setError(`Error generating Education ID: ${countError.message}`);
                    setSave(false);
                    return;
                }

                const newEducationId = yearPrefix * 10000 + ((count ?? 0) + 1);

                const payload = {
                    educationid: newEducationId,
                    profileid: form.profileid,
                    typeOfProgram: form.typeOfProgram || null,
                    programCourse: form.programCourse || null,
                    status: form.status || null,
                    institutionOrCenter: form.institutionOrCenter || null,
                    enroll_dropout_Date: form.enroll_dropout_Date || null,
                    gradeLevel: form.gradeLevel || null,
                };

                const { error } = await supabase
                    .from('EducationAndTraining')
                    .insert(payload);

                if (error) throw error;

                await onSave(payload);
                setForm(emptyForm);
            }
        } catch (error: any) {
            console.error('Save error:', error);
            setError(error.message || 'An error occurred while saving');
        } finally {
            setSave(false);
        }
    };

    const showEmptyProfilesMessage = useMemo(
        () => !loading && profiles.length === 0,
        [loading, profiles.length],
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
                        {isEditing ? 'Edit Education Record' : 'Add Education Record'}
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
                            {isEditing ? 'Edit Education & Training Record' : 'Education & Training Form'}
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
                                            disabled={save || showEmptyProfilesMessage || prefillLoading}
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
                                            {filteredProfiles.map((profile) => (
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

                        {/* EDUCATION INFORMATION */}
                        <IonItemGroup>
                            <IonItemDivider
                                style={{
                                    '--color': '#000',
                                    fontWeight: 'bold',
                                    '--background': '#fff',
                                    marginTop: '10px',
                                }}
                            >
                                Education & Training Information
                            </IonItemDivider>

                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonSelect
                                                className="ion-margin"
                                                label="School / Program"
                                                labelPlacement="floating"
                                                fill="outline"
                                                placeholder="Select program type"
                                                value={form.typeOfProgram}
                                                onIonChange={(e) => handleChange('typeOfProgram', e.detail.value)}
                                                disabled={save}
                                                style={{ '--color': '#000' }}
                                            >
                                                <IonSelectOption value="Elementary">Elementary School</IonSelectOption>
                                                <IonSelectOption value="Junior High">Junior High</IonSelectOption>
                                                <IonSelectOption value="Senior High">Senior High</IonSelectOption>
                                                <IonSelectOption value="College">College</IonSelectOption>
                                                <IonSelectOption value="ALS Elementary">ALS Elementary</IonSelectOption>
                                                <IonSelectOption value="ALS Secondary">ALS Secondary</IonSelectOption>
                                                <IonSelectOption value="TESDA">TESDA</IonSelectOption>
                                            </IonSelect>
                                        </IonItem>
                                    </IonCol>

                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonSelect
                                                className="ion-margin"
                                                label="Select Grade Level"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.gradeLevel}
                                                onIonChange={(e) => handleChange('gradeLevel', e.detail.value)}
                                                disabled={save || !form.typeOfProgram || getGradeLevelOptions().length === 0}
                                                style={{ '--color': '#000' }}
                                            >
                                                {getGradeLevelOptions().map((level) => (
                                                    <IonSelectOption key={level} value={level}>
                                                        {level}
                                                    </IonSelectOption>
                                                ))}
                                            </IonSelect>
                                        </IonItem>
                                    </IonCol>
                                </IonRow>

                                <IonRow>
                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Program or Course"
                                                labelPlacement="floating"
                                                fill="outline"
                                                placeholder="Enter program or course"
                                                value={form.programCourse}
                                                onIonInput={(event) => handleChange('programCourse', event.detail.value ?? '')}
                                                disabled={save}
                                                style={{ '--color': '#000' }}
                                            />
                                        </IonItem>
                                    </IonCol>

                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonSelect
                                                className="ion-margin"
                                                label="Status"
                                                labelPlacement="floating"
                                                fill="outline"
                                                placeholder="Select status"
                                                value={form.status}
                                                onIonChange={(e) => handleChange('status', e.detail.value)}
                                                disabled={save}
                                                style={{ '--color': '#000' }}
                                            >
                                                <IonSelectOption value="Enrolled">Enrolled</IonSelectOption>
                                                <IonSelectOption value="Re-enrolled">Re-enrolled</IonSelectOption>
                                                <IonSelectOption value="Dropout">Dropout</IonSelectOption>
                                            </IonSelect>
                                        </IonItem>
                                    </IonCol>
                                </IonRow>

                                <IonRow>
                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Name of Institution / Training Center"
                                                labelPlacement="floating"
                                                fill="outline"
                                                placeholder="Enter institution name"
                                                value={form.institutionOrCenter}
                                                onIonInput={(event) => handleChange('institutionOrCenter', event.detail.value ?? '')}
                                                disabled={save}
                                                style={{ '--color': '#000' }}
                                            />
                                        </IonItem>
                                    </IonCol>

                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Date Enrolled / Dropped"
                                                labelPlacement="floating"
                                                fill="outline"
                                                type="date"
                                                value={form.enroll_dropout_Date}
                                                onIonInput={(event) => handleChange('enroll_dropout_Date', event.detail.value ?? '')}
                                                disabled={save}
                                                style={{ '--color': '#000' }}
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
                                    {save ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
                                </IonButton>
                            </IonCol>
                            <IonCol size="auto">
                                <IonButton
                                    color="medium"
                                    fill="outline"
                                    onClick={onClose}
                                    disabled={save}
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

export default AddEnrollRecordModal;
import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../utils/supabaseClients';
import { search } from 'ionicons/icons';

interface EducationRecordProps {
    isOpen: boolean;
    onClose:() => void;
    onSave: (record:any) => Promise<void>;
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
    const isLoadingEditData = useRef(false);
    const previousTypeOfProgram = useRef<string>('');

    const gradeLevelOptions: Record<string, string[]> = {
        'elementary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
        'junior high': ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        'senior high': ['Grade 11', 'Grade 12'],
        'college': ['1st Year', '2nd Year', '3rd Year', '4th Year',],
    };

    const getGradeLevelOptions = () => {
        const programType = form.typeOfProgram.toLowerCase();
        return gradeLevelOptions[programType] || [];
    };

    useEffect(() =>{
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
            
            // Reset the flag after data is loaded with longer timeout
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

    const handleProfileSelect = async (profile: ProfileOption) => {
        setError(null);

        setForm((prevForm) => ({
            ...prevForm,
            profileid: profile.profileid,
            profileSearch: `${profile.lastName ?? ''}, ${profile.firstName ?? ''} (ID: ${profile.profileid})`,
        }));
        setShowSuggestions(false);
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

                console.log('Updating education record with payload:', payload);
                console.log('Education ID:', editingEducation.educationid);

                // First, verify the record exists
                const { data: beforeData, error: beforeError } = await supabase
                    .from('EducationAndTraining')
                    .select('*')
                    .eq('educationid', editingEducation.educationid)
                    .single();

                console.log('Before update:', { beforeData, beforeError });

                // Perform the update
                const { data, error, count, status, statusText } = await supabase
                    .from('EducationAndTraining')
                    .update(payload)
                    .eq('educationid', editingEducation.educationid);

                console.log('Update response:', { data, error, count, status, statusText });

                // Verify the update
                const { data: afterData, error: afterError } = await supabase
                    .from('EducationAndTraining')
                    .select('*')
                    .eq('educationid', editingEducation.educationid)
                    .single();

                console.log('After update:', { afterData, afterError });

                if (error) {
                    console.error('Update error:', error);
                    throw error;
                }

                await onSave({ ...payload, educationid: editingEducation.educationid });
                setForm(emptyForm);
            } else {
                // Create new record
                const currentYear = new Date().getFullYear();
                const yearPrefix = parseInt(currentYear.toString());

                const {count, error: countError} = await supabase
                    .from('EducationAndTraining')
                    .select('*', {count: 'exact', head: true})
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

                const {data, error} = await supabase
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
        <IonModal isOpen={isOpen} onDidDismiss={onClose}  style={{'--width':'100%','--height':'100%',}}>
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
                        {isEditing ? 'Edit Education Record' : 'Add Education Record'}
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
            {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <IonSpinner />
                    </div>
                ) : (
                    <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff" }}>
                        <IonCardContent style={{"--background": "#fff",}}>
                            <IonList style={{ "--background": "#fff",}}>

                                {error && (
                                <IonText color="danger" style={{ display: "block", marginBottom: "1rem" }}>
                                    {error}
                                </IonText>
                                )}

                                {/* Profile Selector */}
                                <IonItem style={{ "--background": "#fff", "--color": "#000000", '--background-hover':'#fff', '--background-focused':'transparent','--background-activated':'#fff', position: 'relative' }}>
                                    <IonLabel position="stacked" style={{ '--color': '#000000' }}>
                                        Name <IonText color="danger">*</IonText>
                                    </IonLabel>
                                    <IonInput
                                        placeholder="Search by name..."
                                        value={form.profileSearch}
                                        onIonInput={(event) => handleProfileSearch(event.detail.value ?? '')}
                                        disabled={save || showEmptyProfilesMessage || prefillLoading}
                                        style={{ '--color': '#000000' }}
                                    />
                                    {prefillLoading && (
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

                                {/* Type of Program */}
                                <IonItem  style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                                    <IonLabel position="stacked" style={{ '--color': '#000000' }}>School / Program</IonLabel>
                                    <IonSelect
                                        className='ion-margin'
                                        placeholder='Select'
                                        value={form.typeOfProgram}
                                        style={{"--color": "#000" }}
                                        onIonChange={(e) => handleChange("typeOfProgram", e.detail.value)}
                                        disabled={save}
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

                                {/* School Grade*/}
                                <IonItem  style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent', }}>
                                    <IonLabel position="stacked" style={{ '--color': '#000000' }}>Grade Level</IonLabel>
                                    <IonSelect
                                        className='ion-margin'
                                        placeholder='Select Grade Level'
                                        value={form.gradeLevel}
                                        style={{"--color": "#000" }}
                                        onIonChange={(e) => handleChange("gradeLevel", e.detail.value)}
                                        disabled={save || !form.typeOfProgram || getGradeLevelOptions().length === 0}
                                    >
                                        {getGradeLevelOptions().map((level) => (
                                            <IonSelectOption key={level} value={level}>
                                                {level}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>

                                {/* Program Course */}
                                <IonItem style={{ "--background": "#fff", "--color": "#000000" }}>
                                    <IonLabel position="stacked" style={{ '--color': '#000000' }}>Program or Course</IonLabel>
                                    <IonInput
                                        type="text"
                                        value={form.programCourse}
                                        onIonChange={(event) => handleChange("programCourse", event.detail.value ?? '')}
                                        style={{ '--color': '#000000' }}
                                    />
                                </IonItem>

                                {/* Status */}
                                <IonItem style={{ "--background": "#fff", "--color": "#000", '--background-hover':'transparent' }}>
                                    <IonLabel position="stacked" style={{ '--color': '#000000' }}>Status</IonLabel>
                                    <IonSelect
                                        className='ion-margin'
                                        placeholder='Select Status'
                                        value={form.status}
                                        style={{ "--color": "#000" }}
                                        onIonChange={(e) => handleChange("status", e.detail.value)}
                                        disabled={save}
                                    >
                                        <IonSelectOption value="Enrolled">Enrolled</IonSelectOption>
                                        <IonSelectOption value="Re-enrolled">Re-enrolled</IonSelectOption>
                                        <IonSelectOption value="Dropout">Dropout</IonSelectOption>
                                    </IonSelect>
                                </IonItem>

                                {/* Other Fields */}
                                {[
                                { label: "Name of Institution / Training Center", key: "institutionOrCenter", type: "text" as const },
                                { label: "Date Enrolled / Dropped", key: "enroll_dropout_Date", type: "date" as const },
                                ].map((item) => (
                                <IonItem key={item.key} style={{ "--background": "#fff", "--color": "#000000" }}>
                                    <IonLabel position="stacked" style={{ '--color': '#000000' }}>{item.label}</IonLabel>
                                    <IonInput
                                    type={item.type ?? "text"}
                                    value={(form as any)[item.key]}
                                    onIonChange={(event) => handleChange(item.key as keyof formState, event.detail.value ?? '')}
                                    style={{ '--color': '#000000' }}
                                    />
                                </IonItem>
                                ))}

                            </IonList>

                            {showEmptyProfilesMessage && (
                                <IonText color="medium" style={{ display: 'block', marginTop: '1rem' }}>
                                No profiles found. Choose a profile first.
                                </IonText>
                            )}

                            <IonRow className="ion-justify-content-center ion-margin-top" style={{ '--background': 'transparent' }}>
                                <IonCol size="auto">
                                <IonButton
                                    expand="block"
                                    onClick={handleSave}
                                    style={{ '--background': '#002d54', color: '#fff' }}
                                    disabled={save || loading || showEmptyProfilesMessage || prefillLoading}
                                >
                                    {save ? <IonSpinner name="lines-small" /> : (isEditing ? 'Update' : 'Save')}
                                </IonButton>
                                </IonCol>

                                <IonCol size="auto">
                                    <IonButton color="medium" fill="outline" onClick={onClose} disabled={loading}>
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

export default AddEnrollRecordModal;
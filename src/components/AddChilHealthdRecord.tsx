import { IonButton, IonCard, IonCardContent, IonCheckbox, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import { search } from 'ionicons/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClients';

interface AddChildHealthRecordProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record : any) => Promise<void>;
}

interface HealthRecordOption {
    health_id: number;
    profileid: number;
    firstName: string;
    lastName: string;
}

interface FormState {
    health_id: number | null;
    healthSearch: string;
    childName: string;
    childAge: string;
    gender: string;
    height: number;
    status: string;
    weight: number;
    head_circumference: number;
    BCG: boolean;
    heaptitis_b: boolean;
    pentavalent_vaccine: boolean;
    oral_polio_vaccine: boolean;
    inactive_polio: boolean;
    pneumoccal_conjugate: boolean;
    measles_rubella: boolean;
    type_of_delivery: string;
    complications: string;
}

const emptyForm : FormState = {
    health_id: null,
    healthSearch: '',
    childName: '',
    childAge: '',
    gender: '',
    height: 0,
    weight: 0,
    status: '',
    head_circumference: 0,
    BCG: false,
    heaptitis_b: false,
    pentavalent_vaccine: false,
    oral_polio_vaccine: false,
    inactive_polio: false,
    pneumoccal_conjugate: false,
    measles_rubella: false,
    type_of_delivery: '',
    complications: '',
};

const AddChildHealthRecord: React.FC<AddChildHealthRecordProps> = ({ isOpen, onClose, onSave }) => {
    const [healthRecords, setHealthRecords] = useState<HealthRecordOption[]>([]); 
    const [loading, setLoading] = useState(false);
    const [save, setSave] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredRecords, setFilteredRecords] = useState<HealthRecordOption[]>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        setForm(emptyForm);
        setError(null);
        void loadHealthRecords();
    }, [isOpen]);

    const handleHealthSearch = (searchValue: string) => {
        setForm((prevForm) => ({
            ...prevForm,
            healthSearch: searchValue,
            health_id: null,
        }));

        if (searchValue.trim() === '') {
            setFilteredRecords([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = healthRecords.filter((record) => {
            const fullName = `${record.firstName} ${record.lastName}`.toLowerCase();
            const healthId = record.health_id.toString();
            return fullName.includes(searchValue.toLowerCase()) || healthId.includes(searchValue);
        });

        setFilteredRecords(filtered);
        setShowSuggestions(true);
    };

    const loadHealthRecords = async () => {
        setLoading(true);
        try {
            const {data, error} = await supabase
                .from('maternalhealthRecord')
                .select(`
                    health_id,
                    profileid,
                    profile:profileid (
                        firstName,
                        lastName
                    )
                `)
                .order('health_id', { ascending: false });

            if (error) {
                setError(error.message);
            } else {
                const formattedData = data?.map((item: any) => ({
                    health_id: item.health_id,
                    profileid: item.profileid,
                    firstName: item.profile?.firstName || null,
                    lastName: item.profile?.lastName || null,
                })) || [];
                setHealthRecords(formattedData);
            }
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

    const handleHealthSelect = (record: HealthRecordOption) => {
        setError(null);
        setShowSuggestions(false);
        setFilteredRecords([]);

        setForm({
            ...emptyForm,
            health_id: record.health_id,
            healthSearch: `${record.lastName ?? ''}, ${record.firstName ?? ''} (Health ID: ${record.health_id})`,
        });
    };

    const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prevForm) => ({
            ...prevForm,
            [key]: value,
        }));
    };

    const handleSave = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!form.health_id) {
            setError('Please select a health record.');
            return;
        }
        if (!form.childName.trim()) {
            setError('Please enter child name.');
            return;
        }
        if (!form.childAge.trim()) {
            setError('Please enter child age.');
            return;
        }

        setSave(true);
        setError(null);

        const currentYear = new Date().getFullYear();
        const yearPrefix = currentYear.toString();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const newChildId = parseInt(`${yearPrefix}${randomSuffix}`);

        const payload = {
            childid: newChildId,
            childName: form.childName,
            childAge: form.childAge,
            height: form.height || 0,
            weight: form.weight || 0,
            health_id: form.health_id,
            gender: form.gender,
            status: form.status,
            BCG: form.BCG,
            heaptitis_b: form.heaptitis_b,
            pentavalent_vaccine: form.pentavalent_vaccine,
            oral_polio_vaccine: form.oral_polio_vaccine,
            'inactive-polio': form.inactive_polio,
            onuemoccal_conjucate: form.pneumoccal_conjugate,
            Measssles_rubella: form.measles_rubella,
            type_of_delivery: form.type_of_delivery || null,
            head_circumference: form.head_circumference || 0,
            complications: form.complications || null,
        };

        const { error } = await supabase
            .from('childRecord')
            .insert([payload]);

        if (error) {
            setError(error.message);
        } else {
            await onSave(payload);
            setForm(emptyForm);
        }
        setSave(false);
    };

    const showEmptyRecordsMessage = useMemo(
        () => !loading && healthRecords.length === 0,
        [loading, healthRecords.length]
    );

    const vaccines = [
        { key: 'BCG', label: 'BCG' },
        { key: 'heaptitis_b', label: 'Hepatitis B' },
        { key: 'pentavalent_vaccine', label: 'Pentavalent Vaccine' },
        { key: 'oral_polio_vaccine', label: 'Oral Polio Vaccine (OPV)' },
        { key: 'inactive_polio', label: 'Inactivated Polio Vaccine (IPV)' },
        { key: 'pneumoccal_conjugate', label: 'Pneumococcal Conjugate Vaccine' },
        { key: 'measles_rubella', label: 'Measles-Rubella Vaccine' },
    ];

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
                        Add Child Health Record
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
                            Child Health Record Form
                        </h2>

                        {/* HEALTH RECORD SELECTION */}
                        <IonItemGroup>
                            <IonItemDivider
                                style={{
                                    '--color': '#000',
                                    fontWeight: 'bold',
                                    '--background': '#fff',
                                }}
                            >
                                Select Teenage Parent
                            </IonItemDivider>

                            <IonRow>
                                <IonCol>
                                    <IonItem lines="none" style={{ '--background': '#fff', position: 'relative' }}>
                                        <IonInput
                                            className="ion-margin"
                                            label="Search Health Record (Name or Health ID)"
                                            labelPlacement="floating"
                                            fill="outline"
                                            placeholder="Type name or health ID to search..."
                                            value={form.healthSearch}
                                            onIonInput={(event) => handleHealthSearch(event.detail.value ?? '')}
                                            disabled={save || showEmptyRecordsMessage}
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
                                            {filteredRecords.map((record) => (
                                                <div
                                                    key={record.health_id}
                                                    onClick={() => handleHealthSelect(record)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee',
                                                        color: '#000',
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                                                >
                                                    {record.lastName ?? 'Unknown'}, {record.firstName ?? 'Unknown'} (Health ID: {record.health_id})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </IonCol>
                            </IonRow>
                        </IonItemGroup>

                        {/* CHILD INFORMATION */}
                        <IonItemGroup>
                            <IonItemDivider
                                style={{
                                    '--color': '#000',
                                    fontWeight: 'bold',
                                    '--background': '#fff',
                                    marginTop: '10px',
                                }}
                            >
                                Child Information
                            </IonItemDivider>
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Child Name"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.childName}
                                                onIonInput={(e) => handleChange('childName', e.detail.value ?? '')}
                                                style={{ '--color': '#000' }}
                                                disabled={save}
                                            />
                                        </IonItem>
                                    </IonCol>

                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Child Age"
                                                labelPlacement="floating"
                                                fill="outline"
                                                placeholder="e.g., 6 months, 1 year"
                                                value={form.childAge}
                                                onIonInput={(e) => handleChange('childAge', e.detail.value ?? '')}
                                                style={{ '--color': '#000' }}
                                                disabled={save}
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>

                                <IonRow>
                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonSelect
                                                className="ion-margin"
                                                label="Type of Delivery"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.type_of_delivery}
                                                onIonChange={(e) => handleChange('type_of_delivery', e.detail.value)}
                                                style={{ '--color': '#000' }}
                                                disabled={save}
                                            >
                                                <IonSelectOption value="Normal Delivery">Normal Delivery</IonSelectOption>
                                                <IonSelectOption value="Cesarean Section">Cesarean Section (C-Section)</IonSelectOption>
                                                <IonSelectOption value="Assisted Delivery">Assisted Delivery (Forceps/Vacuum)</IonSelectOption>
                                            </IonSelect>
                                        </IonItem>
                                    </IonCol>

                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonSelect
                                                className="ion-margin"
                                                label="Gender"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.gender}
                                                onIonChange={(e) => handleChange('gender', e.detail.value)}
                                                style={{ '--color': '#000' }}
                                                disabled={save}
                                            >
                                                <IonSelectOption value="Male">Male</IonSelectOption>
                                                <IonSelectOption value="Female">Female</IonSelectOption>
                                            </IonSelect>
                                        </IonItem>
                                    </IonCol>
                                </IonRow>

                                <IonRow>
                                    <IonCol size="12" size-md="6">
                                        <IonLabel style={{ fontWeight: 'bold', color: '#000',marginLeft:'10px' }}>Status</IonLabel>
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            
                                            <IonSelect
                                                className="ion-margin"
                                                label="Select Status"
                                                labelPlacement="floating"
                                                fill="outline"
                                                value={form.status}
                                                onIonChange={(e) => handleChange('status', e.detail.value)}
                                                style={{ '--color': '#000' }}
                                                disabled={save}
                                            >
                                                <IonSelectOption value="Normal"> Normal</IonSelectOption>
                                                <IonSelectOption value="With Health Complications">With Health Complications</IonSelectOption>
                                            </IonSelect>
                                        </IonItem>
                                    </IonCol>

                                    <IonCol size="12" size-md="6">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                
                                                label="What Type of Complications?"
                                                labelPlacement='floating'
                                                fill='outline'
                                                value={form.complications}
                                                onIonChange={(e) => handleChange('complications', e.detail.value || '')}
                                                style={{ '--color': '#000',marginTop:'40px' }}
                                                disabled={form.status !== 'With Health Complications' || save}
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonItemGroup>

                        {/* VITAL MEASUREMENTS */}
                        <IonItemGroup>
                            <IonItemDivider
                                style={{
                                    '--color': '#000',
                                    fontWeight: 'bold',
                                    '--background': '#fff',
                                }}
                            >
                                Vital Measurements
                            </IonItemDivider>
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="12" size-md="4">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Height (cm)"
                                                labelPlacement="floating"
                                                fill="outline"
                                                type="number"
                                                value={form.height}
                                                onIonInput={(e) => handleChange('height', parseFloat(e.detail.value ?? '0'))}
                                                style={{ '--color': '#000' }}
                                                disabled={save}
                                            />
                                        </IonItem>
                                    </IonCol>

                                    <IonCol size="12" size-md="4">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Weight (kg)"
                                                labelPlacement="floating"
                                                fill="outline"
                                                type="number"
                                                value={form.weight}
                                                onIonInput={(e) => handleChange('weight', parseFloat(e.detail.value ?? '0'))}
                                                style={{ '--color': '#000' }}
                                                disabled={save}
                                            />
                                        </IonItem>
                                    </IonCol>

                                    <IonCol size="12" size-md="4">
                                        <IonItem lines="none" style={{ '--background': '#fff' }}>
                                            <IonInput
                                                className="ion-margin"
                                                label="Head Circumference (cm)"
                                                labelPlacement="floating"
                                                fill="outline"
                                                type="number"
                                                value={form.head_circumference}
                                                onIonInput={(e) => handleChange('head_circumference', parseFloat(e.detail.value ?? '0'))}
                                                style={{ '--color': '#000' }}
                                                disabled={save}
                                            />
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonItemGroup>

                        {/* IMMUNIZATION RECORD */}
                        <IonItemGroup>
                            <IonItemDivider
                                style={{
                                    '--color': '#000',
                                    fontWeight: 'bold',
                                    '--background': '#fff',
                                }}
                            >
                                Immunization Record
                            </IonItemDivider>

                            <IonGrid>
                                <IonRow>
                                    {vaccines.map((vaccine) => (
                                        <IonCol size="12" size-md="6" key={vaccine.key}>
                                            <IonItem lines="none" style={{ '--background': '#fff', '--color': '#000' }}>
                                                <IonCheckbox
                                                    checked={form[vaccine.key as keyof FormState] as boolean}
                                                    onIonChange={(e) => handleChange(vaccine.key as keyof FormState, e.detail.checked as any)}
                                                    disabled={save}
                                                    labelPlacement="end"
                                                >
                                                    {vaccine.label}
                                                </IonCheckbox>
                                            </IonItem>
                                        </IonCol>
                                    ))}
                                </IonRow>
                            </IonGrid>
                        </IonItemGroup>

                        {/* BUTTONS */}
                        <IonRow className="ion-justify-content-center ion-margin-top">
                            <IonCol size="auto">
                                <IonButton color="primary" onClick={handleSave} disabled={save}>
                                    {save ? 'Saving...' : 'Save'}
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
            </IonContent>
        </IonModal>
    );
};

export default AddChildHealthRecord;
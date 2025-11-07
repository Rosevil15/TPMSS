import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonRow, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClients';

interface AddPrenatalPostnatalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: any) => Promise<void>;
}

interface HealthRecordOption {
    health_id: number;
    profileid: number;
    firstName: string | null;
    lastName: string | null;
    pregnancy_status: string | null;
}

interface FormState {
    health_id: number | null;
    healthSearch: string;
    week_of_pregnancy: string;
    prenatal_visit_num: number;
    prenatal_visit_date: string;
    postnatal_visit_num: number;
    postnatal_visit_date: string;
    care_compliance: string;
    prenatal_next_sched: string;
    postnatal_next_sched: string;
}

const emptyForm: FormState = {
    health_id: null,
    healthSearch: '',
    week_of_pregnancy: '',
    prenatal_visit_num: 0,
    prenatal_visit_date: '',
    postnatal_visit_num: 0,
    postnatal_visit_date: '',
    care_compliance: '',
    prenatal_next_sched: '',
    postnatal_next_sched: '',
};

const AddPrenatalPostnatal: React.FC<AddPrenatalPostnatalProps> = ({ isOpen, onClose, onSave }) => {
    const [healthRecords, setHealthRecords] = useState<HealthRecordOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [save, setSave] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredRecords, setFilteredRecords] = useState<HealthRecordOption[]>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [visitType, setVisitType] = useState<'prenatal' | 'postnatal'>('prenatal');

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        setForm(emptyForm);
        setError(null);
        setVisitType('prenatal');
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
            const fullName = `${record.firstName ?? ''} ${record.lastName ?? ''}`.toLowerCase();
            const healthId = record.health_id.toString();
            return fullName.includes(searchValue.toLowerCase()) || healthId.includes(searchValue);
        });

        setFilteredRecords(filtered);
        setShowSuggestions(true);
    };

    const loadHealthRecords = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('maternalhealthRecord')
                .select(`
                    health_id,
                    profileid,
                    pregnancy_status,
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
                    pregnancy_status: item.pregnancy_status || null,
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

    const fetchNextVisitNumber = async (healthId: number, type: 'prenatal' | 'postnatal') => {
        try {
            const { data, error } = await supabase
                .from('PrenatalPostnatalVisit')
                .select(type === 'prenatal' ? 'prenatal_visit_num' : 'postnatal_visit_num')
                .eq('health_id', healthId)
                .order(type === 'prenatal' ? 'prenatal_visit_num' : 'postnatal_visit_num', { ascending: false })
                .limit(1);

            if (error) {
                console.error('Error fetching visit number:', error);
                return 1;
            }

            if (data && data.length > 0) {
                const lastVisitNum = type === 'prenatal' 
                    ? (data[0] as { prenatal_visit_num: number }).prenatal_visit_num 
                    : (data[0] as { postnatal_visit_num: number }).postnatal_visit_num;
                return (lastVisitNum || 0) + 1;
            }

            return 1; // First visit
        } catch (error) {
            console.error('Error fetching visit number:', error);
            return 1;
        }
    };

    const handleHealthSelect = async (record: HealthRecordOption) => {
        setError(null);
        setShowSuggestions(false);
        setFilteredRecords([]);

        // Fetch next visit numbers for both prenatal and postnatal
        const nextPrenatalNum = await fetchNextVisitNumber(record.health_id, 'prenatal');
        const nextPostnatalNum = await fetchNextVisitNumber(record.health_id, 'postnatal');

        setForm({
            ...emptyForm,
            health_id: record.health_id,
            healthSearch: `${record.lastName ?? ''}, ${record.firstName ?? ''} (Health ID: ${record.health_id})`,
            prenatal_visit_num: nextPrenatalNum,
            postnatal_visit_num: nextPostnatalNum,
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

        setSave(true);
        setError(null);

        const currentYear = new Date().getFullYear();
        const yearPrefix = currentYear.toString();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const newVisitId = parseInt(`${yearPrefix}${randomSuffix}`);

        const payload = {
            visitid: newVisitId,
            health_id: form.health_id,
            week_of_pregnancy: form.week_of_pregnancy || null,
            prenatal_visit_num: form.prenatal_visit_num || 0,
            prenatal_visit_date: form.prenatal_visit_date || null,
            postnatal_visit_num: form.postnatal_visit_num || 0,
            postnatal_visit_date: form.postnatal_visit_date || null,
            care_compliance: form.care_compliance || null,
            prenatal_next_sched: form.prenatal_next_sched || null,
            postnatal_next_sched: form.postnatal_next_sched || null,
        };

        const { error } = await supabase
            .from('PrenatalPostnatalVisit')
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
                        Add Prenatal/Postnatal Visit Record
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
                            Prenatal/Postnatal Visit Form
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
                                Select Teenage Parent Health Record
                            </IonItemDivider>

                            <IonRow>
                                <IonCol>
                                    <IonItem lines="none" style={{ '--background': '#fff', position: 'relative' }}>
                                        <IonInput
                                            className="ion-margin"
                                            label="Search Teenage Parent"
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
                                                    {record.pregnancy_status && (
                                                        <span style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>
                                                            - {record.pregnancy_status}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </IonCol>
                            </IonRow>
                        </IonItemGroup>

                        {/* VISIT TYPE SELECTION */}
                        <IonItemGroup>
                            <IonItemDivider
                                style={{
                                    '--color': '#000',
                                    fontWeight: 'bold',
                                    '--background': '#fff',
                                    marginTop: '10px',
                                }}
                            >
                                Visit Type
                            </IonItemDivider>
                            <IonRow>
                                <IonCol>
                                    <IonItem lines="none" style={{ '--background': '#fff' }}>
                                        <IonSelect
                                            className="ion-margin"
                                            label="Select Visit Type"
                                            labelPlacement="floating"
                                            fill="outline"
                                            value={visitType}
                                            onIonChange={(e) => setVisitType(e.detail.value)}
                                            style={{ '--color': '#000' }}
                                            disabled={save}
                                        >
                                            <IonSelectOption value="prenatal">Prenatal Visit</IonSelectOption>
                                            <IonSelectOption value="postnatal">Postnatal Visit</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </IonCol>
                            </IonRow>
                        </IonItemGroup>

                        {/* PRENATAL VISIT SECTION */}
                        {visitType === 'prenatal' && (
                            <IonItemGroup>
                                <IonItemDivider
                                    style={{
                                        '--color': '#000',
                                        fontWeight: 'bold',
                                        '--background': '#fff',
                                    }}
                                >
                                    Prenatal Visit Information
                                </IonItemDivider>
                                <IonGrid>
                                    <IonRow>
                                        <IonCol size="12" size-md="6">
                                            <IonItem lines="none" style={{ '--background': '#fff' }}>
                                                <IonInput
                                                    className="ion-margin"
                                                    label="Prenatal Visit Number"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    type="number"
                                                    value={form.prenatal_visit_num}
                                                    onIonInput={(e) => handleChange('prenatal_visit_num', parseInt(e.detail.value ?? '0'))}
                                                    style={{ '--color': '#000' }}
                                                    disabled={true}
                                                    readonly
                                                />
                                            </IonItem>
                                            <p style={{ fontSize: '11px', color: '#666', marginLeft: '16px', marginTop: '1px' }}>
                                                Auto-generated based on previous visits
                                            </p>
                                        </IonCol>

                                        <IonCol size="12" size-md="6">
                                            <IonItem lines="none" style={{ '--background': '#fff' }}>
                                                <IonInput
                                                    className="ion-margin"
                                                    label="Week of Pregnancy"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    placeholder="e.g., 12 weeks, 20 weeks"
                                                    value={form.week_of_pregnancy}
                                                    onIonInput={(e) => handleChange('week_of_pregnancy', e.detail.value ?? '')}
                                                    style={{ '--color': '#000' }}
                                                    disabled={save}
                                                />
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" size-md="6">
                                            <IonItem lines="none" style={{ '--background': '#fff' }}>
                                                <IonInput
                                                    className="ion-margin"
                                                    label="Prenatal Visit Date"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    type="date"
                                                    value={form.prenatal_visit_date}
                                                    onIonInput={(e) => handleChange('prenatal_visit_date', e.detail.value ?? '')}
                                                    style={{ '--color': '#000' }}
                                                    disabled={save}
                                                />
                                            </IonItem>
                                        </IonCol>

                                        <IonCol size="12" size-md="6">
                                            <IonItem lines="none" style={{ '--background': '#fff' }}>
                                                <IonInput
                                                    className="ion-margin"
                                                    label="Next Prenatal Schedule"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    type="date"
                                                    value={form.prenatal_next_sched}
                                                    onIonInput={(e) => handleChange('prenatal_next_sched', e.detail.value ?? '')}
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
                                                    label="Compliance"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    value={form.care_compliance}
                                                    onIonChange={(e) => handleChange('care_compliance', e.detail.value)}
                                                    style={{ '--color': '#000' }}
                                                    disabled={save}
                                                >
                                                    <IonSelectOption value="Compliant">Compliant</IonSelectOption>
                                                    <IonSelectOption value="Non-Compliant">Non-Compliant</IonSelectOption>
                                                    <IonSelectOption value="Partially Compliant">Partially Compliant</IonSelectOption>
                                                </IonSelect>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            </IonItemGroup>
                        )}

                        {/* POSTNATAL VISIT SECTION */}
                        {visitType === 'postnatal' && (
                            <IonItemGroup>
                                <IonItemDivider
                                    style={{
                                        '--color': '#000',
                                        fontWeight: 'bold',
                                        '--background': '#fff',
                                    }}
                                >
                                    Postnatal Visit Information
                                </IonItemDivider>
                                <IonGrid>
                                    <IonRow>
                                        <IonCol size="12" size-md="6">
                                            <IonItem lines="none" style={{ '--background': '#fff' }}>
                                                <IonInput
                                                    className="ion-margin"
                                                    label="Postnatal Visit Number"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    type="number"
                                                    value={form.postnatal_visit_num}
                                                    onIonInput={(e) => handleChange('postnatal_visit_num', parseInt(e.detail.value ?? '0'))}
                                                    style={{ '--color': '#000' }}
                                                    disabled={true}
                                                    readonly
                                                />
                                            </IonItem>
                                            <p style={{ fontSize: '11px', color: '#666', marginLeft: '16px', marginTop: '1px' }}>
                                                Auto-generated based on previous visits
                                            </p>
                                        </IonCol>

                                        <IonCol size="12" size-md="6">
                                            <IonItem lines="none" style={{ '--background': '#fff' }}>
                                                <IonInput
                                                    className="ion-margin"
                                                    label="Postnatal Visit Date"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    type="date"
                                                    value={form.postnatal_visit_date}
                                                    onIonInput={(e) => handleChange('postnatal_visit_date', e.detail.value ?? '')}
                                                    style={{ '--color': '#000' }}
                                                    disabled={save}
                                                />
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" size-md="6">
                                            <IonItem lines="none" style={{ '--background': '#fff' }}>
                                                <IonInput
                                                    className="ion-margin"
                                                    label="Next Postnatal Schedule"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    type="date"
                                                    value={form.postnatal_next_sched}
                                                    onIonInput={(e) => handleChange('postnatal_next_sched', e.detail.value ?? '')}
                                                    style={{ '--color': '#000' }}
                                                    disabled={save}
                                                />
                                            </IonItem>
                                        </IonCol>

                                        <IonCol size="12" size-md="6">
                                            <IonItem lines="none" style={{ '--background': '#fff' }}>
                                                <IonSelect
                                                    className="ion-margin"
                                                    label="Care Compliance"
                                                    labelPlacement="floating"
                                                    fill="outline"
                                                    value={form.care_compliance}
                                                    onIonChange={(e) => handleChange('care_compliance', e.detail.value)}
                                                    style={{ '--color': '#000' }}
                                                    disabled={save}
                                                >
                                                    <IonSelectOption value="Compliant">Compliant</IonSelectOption>
                                                    <IonSelectOption value="Non-Compliant">Non-Compliant</IonSelectOption>
                                                    <IonSelectOption value="Partially Compliant">Partially Compliant</IonSelectOption>
                                                </IonSelect>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            </IonItemGroup>
                        )}

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

export default AddPrenatalPostnatal;
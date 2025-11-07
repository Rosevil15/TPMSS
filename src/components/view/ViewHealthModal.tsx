import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonRow, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClients';
import { checkmarkCircleOutline, closeCircleOutline, medical } from 'ionicons/icons';

interface ViewHealthModalProps {
    isOpen: boolean;
    onClose: () => void;
    healthID: number | null;
}

interface ChildRecord {
    childid: number;
    childName: string;
    childAge: string;
    height: number;
    weight: number;
    head_circumference: number;
    BCG: boolean;
    heaptitis_b: boolean;
    pentavalent_vaccine: boolean;
    oral_polio_vaccine: boolean;
    'inactive-polio': boolean;
    onuemoccal_conjucate: boolean;
    Measssles_rubella: boolean;
    type_of_delivery: string;
}

interface VisitRecord {
    visitid: number;
    prenatal_visit_num: number;
    postnatal_visit_num: number;
    postnatal_visit_date: string;
    care_compliance: string;
    prenatal_next_sched: string;
    postnatal_next_sched: string;
}

const ViewHealthModal: React.FC<ViewHealthModalProps> = ({ isOpen, onClose, healthID }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [healthData, setHealthData] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [childRecords, setChildRecords] = useState<ChildRecord[]>([]);
    const [visitRecords, setVisitRecords] = useState<VisitRecord[]>([]);

    useEffect(() => {
        if (isOpen && healthID) {
            fetchHealthData();
        }
    }, [isOpen, healthID]);

    const fetchHealthData = async () => {
        if (!healthID) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch health record
            const { data: health, error: healthError } = await supabase
                .from('maternalhealthRecord')
                .select('*')
                .eq('health_id', healthID)
                .single();

            if (healthError) {
                console.error('Error fetching health data:', healthError);
                throw healthError;
            }

            // Fetch profile data
            if (health?.profileid) {
                const { data: profile, error: profileError } = await supabase
                    .from('profile')
                    .select('firstName,lastName,profileid')
                    .eq('profileid', health.profileid)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile data:', profileError);
                    throw profileError;
                }

                setProfileData(profile);
            }

            // Fetch child records
            const { data: children, error: childError } = await supabase
                .from('childRecord')
                .select('*')
                .eq('health_id', healthID);

            if (childError) {
                console.error('Error fetching child records:', childError);
            } else {
                setChildRecords(children || []);
            }

            // Fetch prenatal/postnatal visit records
            const { data: visits, error: visitError } = await supabase
                .from('PrenatalPostnatalVisit')
                .select('*')
                .eq('health_id', healthID)
                .order('visitid', { ascending: false });

            if (visitError) {
                console.error('Error fetching visit records:', visitError);
            } else {
                setVisitRecords(visits || []);
            }

            setHealthData(health);
        } catch (error: any) {
            console.error('Error fetching health data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatMedicalHistory = (medicalHistory: string) => {
        if (!medicalHistory) return ['N/A'];
        return medicalHistory.split(',').map(item => item.trim());
    };

    const formatSupport = (support: string) => {
        if (!support) return ['N/A'];
        return support.split(',').map(item => item.trim());
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const calculateBMI = (height: number, weight: number) => {
        if (!weight || !height) return 'N/A';
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return bmi.toFixed(2);
    };

    const getBMICategory = (bmi: string) => {
        const bmiValue = parseFloat(bmi);
        if (isNaN(bmiValue)) return { category: 'N/A', color: 'medium' };
        if (bmiValue < 18.5) return { category: 'Underweight', color: 'warning' };
        if (bmiValue < 24.9) return { category: 'Normal weight', color: 'success' };
        if (bmiValue < 29.9) return { category: 'Overweight', color: 'warning' };
        return { category: 'Obesity', color: 'danger' };
    };

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
                        View Health Record
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

            <IonContent className="ion-padding" style={{ '--background': '#f5f5f5' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                        <IonSpinner name="crescent"/>
                    </div>
                ) : error ? (
                    <IonText color="danger">
                        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Error loading health record: {error}</p>
                    </IonText>
                ) : healthData ? (
                    <>
                        {/* MATERNAL HEALTH RECORD */}
                        <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff", marginBottom: '20px' }}>
                            <IonCardContent>
                                <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                    Maternal Health Record
                                </h2>

                                {/* Profile Information */}
                                <IonItemGroup>
                                    <IonItemDivider
                                        style={{
                                            "--color": "#000",
                                            fontWeight: "bold",
                                            "--background": "#fff",
                                        }}
                                    >
                                        Profile Information
                                    </IonItemDivider>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Health Record ID:</strong> {healthData.health_id}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Profile ID:</strong> {healthData.profileid}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    {profileData && (
                                        <IonRow>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>Name: </strong> {profileData.firstName} {profileData.lastName}
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    )}
                                </IonItemGroup>

                                {/* Pregnancy Information */}
                                <IonItemGroup>
                                    <IonItemDivider
                                        style={{
                                            "--color": "#000",
                                            fontWeight: "bold",
                                            "--background": "#fff",
                                        }}
                                    >
                                        Pregnancy Information
                                    </IonItemDivider>
                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Pregnancy Status:</strong>{' '}
                                                    <IonBadge color={healthData.pregnancy_status === 'Pregnant' ? 'success' : 'medium'}>
                                                        {healthData.pregnancy_status || 'N/A'}
                                                    </IonBadge>
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Stage of Pregnancy:</strong> {healthData.stage_of_pregnancy || 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Number of Pregnancies:</strong> {healthData.num_of_pregnancies || 0}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Last Menstrual Period:</strong> {formatDate(healthData.date_of_last_mens_period)}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonItemGroup>

                                {/* Vital Signs */}
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

                                    <IonRow>
                                        <IonCol size="12" sizeMd="4">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Height:</strong> {healthData.height ? `${healthData.height} cm` : 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="4">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Weight:</strong> {healthData.weight ? `${healthData.weight} kg` : 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="4">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>Temperature:</strong> {healthData.temperature ? `${healthData.temperature}°C` : 'N/A'}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>

                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel>
                                                    <strong>BMI:</strong> {calculateBMI(healthData.height, healthData.weight)}
                                                    {healthData.height && healthData.weight && (
                                                        <>
                                                            {' - '}
                                                            <IonBadge color={getBMICategory(calculateBMI(healthData.height, healthData.weight)).color}>
                                                                {getBMICategory(calculateBMI(healthData.height, healthData.weight)).category}
                                                            </IonBadge>
                                                        </>
                                                    )}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonItemGroup>

                                {/* Medical History */}
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

                                    <IonRow>
                                        <IonCol size="12">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel style={{ whiteSpace: 'normal' }}>
                                                    {formatMedicalHistory(healthData.medical_history).length > 0 ? (
                                                        <div>
                                                            {formatMedicalHistory(healthData.medical_history).map((condition: string, index: number) => (
                                                                <IonBadge
                                                                    key={index}
                                                                    color="danger"
                                                                    style={{
                                                                        margin: '4px',
                                                                        padding: '8px 12px',
                                                                        fontSize: '0.9rem'
                                                                    }}
                                                                >
                                                                    {condition}
                                                                </IonBadge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <em>No medical history recorded</em>
                                                    )}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonItemGroup>

                                {/* Vaccination */}
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
                                        <IonCol size="12">
                                            <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                <IonLabel style={{ whiteSpace: 'normal' }}>
                                                    {(() => {
                                                        try {
                                                            if (healthData.vaccinations) {
                                                                const vaccinations = typeof healthData.vaccinations === 'string' 
                                                                    ? JSON.parse(healthData.vaccinations) 
                                                                    : healthData.vaccinations;
                                                                
                                                                if (Array.isArray(vaccinations) && vaccinations.length > 0) {
                                                                    return (
                                                                        <div>
                                                                            {vaccinations.map((vaccination: any, index: number) => (
                                                                                <div key={vaccination.id || index} style={{ 
                                                                                    display: 'flex', 
                                                                                    alignItems: 'center', 
                                                                                    marginBottom: '8px',
                                                                                    padding: '8px',
                                                                                    backgroundColor: '#f0f8ff',
                                                                                    borderRadius: '4px',
                                                                                    border: '1px solid #e0e0e0'
                                                                                }}>
                                                                                    <IonIcon 
                                                                                        icon={medical} 
                                                                                        color="success" 
                                                                                        style={{ marginRight: '8px' }}
                                                                                    />
                                                                                    <div>
                                                                                        <strong>{vaccination.vaccine_name || 'Unknown Vaccine'}</strong>
                                                                                        <br />
                                                                                        <small style={{ color: '#666' }}>
                                                                                            Doses: {vaccination.doses || 0}
                                                                                        </small>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    );
                                                                }
                                                            }
                                                            return <em>No vaccinations recorded</em>;
                                                        } catch (error) {
                                                            console.error('Error parsing vaccinations:', error);
                                                            return <em>Error loading vaccination data</em>;
                                                        }
                                                    })()}
                                                </IonLabel>
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonItemGroup>


                                {/* RECORD METADATA */}
                                {healthData.createdAt && (
                                    <IonItemGroup>
                                        <IonItemDivider
                                            style={{
                                                "--color": "#000",
                                                fontWeight: "bold",
                                                "--background": "#fff",
                                            }}
                                        >
                                            Record Information
                                        </IonItemDivider>

                                        <IonRow>
                                            <IonCol size="12" sizeMd="6">
                                                <IonItem lines="none" style={{ "--background": "#fff" }}>
                                                    <IonLabel>
                                                        <strong>Created At:</strong> {formatDate(healthData.createdAt)}
                                                    </IonLabel>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </IonItemGroup>
                                )}
                            </IonCardContent>
                        </IonCard>

                        {/* CHILD HEALTH RECORDS */}
                        <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff", marginBottom: '20px' }}>
                            <IonCardHeader>
                                <IonCardTitle style={{ color: '#002d54', fontSize: '1.3rem' }}>
                                    Child Health Records ({childRecords.length})
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                {childRecords.length === 0 ? (
                                    <IonText color="medium">
                                        <p style={{ textAlign: 'center', padding: '20px' }}>No child health records found</p>
                                    </IonText>
                                ) : (
                                    <IonGrid>
                                        {childRecords.map((child, index) => (
                                            <IonCard key={child.childid} style={{ border: '1px solid #ddd', marginBottom: '15px', '--background': '#fafafa' }}>
                                                <IonCardContent>
                                                    <h3 style={{ color: '#002d54', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                                                        Child #{index + 1}: {child.childName}
                                                    </h3>

                                                    <IonRow>
                                                        <IonCol size="12" sizeMd="6">
                                                            <IonLabel>
                                                                <strong>Child ID:</strong> {child.childid}
                                                            </IonLabel>
                                                        </IonCol>
                                                        <IonCol size="12" sizeMd="6">
                                                            <IonLabel>
                                                                <strong>Age:</strong> {child.childAge}
                                                            </IonLabel>
                                                        </IonCol>
                                                    </IonRow>

                                                    <IonRow style={{ marginTop: '10px' }}>
                                                        <IonCol size="12" sizeMd="6">
                                                            <IonLabel>
                                                                <strong>Type of Delivery:</strong> {child.type_of_delivery || 'N/A'}
                                                            </IonLabel>
                                                        </IonCol>
                                                    </IonRow>

                                                    <h4 style={{ marginTop: '15px', color: '#002d54', fontSize: '1rem' }}>Vital Measurements</h4>
                                                    <IonRow>
                                                        <IonCol size="6" sizeMd="4">
                                                            <IonLabel>
                                                                <strong>Height:</strong> {child.height ? `${child.height} cm` : 'N/A'}
                                                            </IonLabel>
                                                        </IonCol>
                                                        <IonCol size="6" sizeMd="4">
                                                            <IonLabel>
                                                                <strong>Weight:</strong> {child.weight ? `${child.weight} kg` : 'N/A'}
                                                            </IonLabel>
                                                        </IonCol>
                                                        <IonCol size="12" sizeMd="4">
                                                            <IonLabel>
                                                                <strong>Head Circumference:</strong> {child.head_circumference ? `${child.head_circumference} cm` : 'N/A'}
                                                            </IonLabel>
                                                        </IonCol>
                                                    </IonRow>

                                                    <h4 style={{ marginTop: '15px', color: '#002d54', fontSize: '1rem' }}>Immunization Record</h4>
                                                    <IonGrid style={{ padding: 0 }}>
                                                        <IonRow>
                                                            <IonCol size="6" sizeMd="4">
                                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <IonIcon 
                                                                        icon={child.BCG ? checkmarkCircleOutline : closeCircleOutline} 
                                                                        color={child.BCG ? 'success' : 'medium'} 
                                                                        style={{ marginRight: '5px' }}
                                                                    />
                                                                    <IonLabel>BCG</IonLabel>
                                                                </div>
                                                            </IonCol>
                                                            <IonCol size="6" sizeMd="4">
                                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <IonIcon 
                                                                        icon={child.heaptitis_b ? checkmarkCircleOutline : closeCircleOutline} 
                                                                        color={child.heaptitis_b ? 'success' : 'medium'} 
                                                                        style={{ marginRight: '5px' }}
                                                                    />
                                                                    <IonLabel>Hepatitis B</IonLabel>
                                                                </div>
                                                            </IonCol>
                                                            <IonCol size="6" sizeMd="4">
                                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <IonIcon 
                                                                        icon={child.pentavalent_vaccine ? checkmarkCircleOutline : closeCircleOutline} 
                                                                        color={child.pentavalent_vaccine ? 'success' : 'medium'} 
                                                                        style={{ marginRight: '5px' }}
                                                                    />
                                                                    <IonLabel>Pentavalent</IonLabel>
                                                                </div>
                                                            </IonCol>
                                                            <IonCol size="6" sizeMd="4">
                                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <IonIcon 
                                                                        icon={child.oral_polio_vaccine ? checkmarkCircleOutline : closeCircleOutline} 
                                                                        color={child.oral_polio_vaccine ? 'success' : 'medium'} 
                                                                        style={{ marginRight: '5px' }}
                                                                    />
                                                                    <IonLabel>OPV</IonLabel>
                                                                </div>
                                                            </IonCol>
                                                            <IonCol size="6" sizeMd="4">
                                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <IonIcon 
                                                                        icon={child['inactive-polio'] ? checkmarkCircleOutline : closeCircleOutline} 
                                                                        color={child['inactive-polio'] ? 'success' : 'medium'} 
                                                                        style={{ marginRight: '5px' }}
                                                                    />
                                                                    <IonLabel>IPV</IonLabel>
                                                                </div>
                                                            </IonCol>
                                                            <IonCol size="6" sizeMd="4">
                                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <IonIcon 
                                                                        icon={child.onuemoccal_conjucate ? checkmarkCircleOutline : closeCircleOutline} 
                                                                        color={child.onuemoccal_conjucate ? 'success' : 'medium'} 
                                                                        style={{ marginRight: '5px' }}
                                                                    />
                                                                    <IonLabel>Pneumococcal</IonLabel>
                                                                </div>
                                                            </IonCol>
                                                            <IonCol size="6" sizeMd="4">
                                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <IonIcon 
                                                                        icon={child.Measssles_rubella ? checkmarkCircleOutline : closeCircleOutline} 
                                                                        color={child.Measssles_rubella ? 'success' : 'medium'} 
                                                                        style={{ marginRight: '5px' }}
                                                                    />
                                                                    <IonLabel>Measles-Rubella</IonLabel>
                                                                </div>
                                                            </IonCol>
                                                        </IonRow>
                                                    </IonGrid>
                                                </IonCardContent>
                                            </IonCard>
                                        ))}
                                    </IonGrid>
                                )}
                            </IonCardContent>
                        </IonCard>

                        {/* PRENATAL/POSTNATAL VISIT RECORDS */}
                        <IonCard style={{ borderRadius: "15px", boxShadow: "0 0 10px #ccc", "--background": "#fff", marginBottom: '20px' }}>
                            <IonCardHeader>
                                <IonCardTitle style={{ color: '#002d54', fontSize: '1.3rem' }}>
                                    Prenatal/Postnatal Visit Records ({visitRecords.length})
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                {visitRecords.length === 0 ? (
                                    <IonText color="medium">
                                        <p style={{ textAlign: 'center', padding: '20px' }}>No visit records found</p>
                                    </IonText>
                                ) : (
                                    <IonGrid>
                                        {visitRecords.map((visit, index) => (
                                            <IonCard key={visit.visitid} style={{ border: '1px solid #ddd', marginBottom: '15px', '--background': '#fafafa' }}>
                                                <IonCardContent>
                                                    <h3 style={{ color: '#002d54', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                                                        Visit #{visitRecords.length - index} (ID: {visit.visitid})
                                                    </h3>

                                                    {visit.prenatal_visit_num > 0 && (
                                                        <>
                                                            <h4 style={{ color: '#002d54', fontSize: '1rem', marginTop: '10px' }}>Prenatal Visit</h4>
                                                            <IonRow>
                                                                <IonCol size="12" sizeMd="6">
                                                                    <IonLabel>
                                                                        <strong>Visit Number:</strong> {visit.prenatal_visit_num}
                                                                    </IonLabel>
                                                                </IonCol>
                                                            </IonRow>
                                                            <IonRow style={{ marginTop: '10px' }}>
                                                                <IonCol size="12" sizeMd="6">
                                                                    <IonLabel>
                                                                        <strong>Next Schedule:</strong> {formatDate(visit.prenatal_next_sched)}
                                                                    </IonLabel>
                                                                </IonCol>
                                                                <IonCol size="12" sizeMd="6">
                                                                    <IonLabel>
                                                                        <strong>Care Compliance:</strong>{' '}
                                                                        <IonBadge color={
                                                                            visit.care_compliance === 'Compliant' ? 'success' :
                                                                            visit.care_compliance === 'Non-Compliant' ? 'danger' : 'warning'
                                                                        }>
                                                                            {visit.care_compliance || 'N/A'}
                                                                        </IonBadge>
                                                                    </IonLabel>
                                                                </IonCol>
                                                            </IonRow>
                                                        </>
                                                    )}

                                                    {visit.postnatal_visit_num > 0 && (
                                                        <>
                                                            <h4 style={{ color: '#002d54', fontSize: '1rem', marginTop: '15px' }}>Postnatal Visit</h4>
                                                            <IonRow>
                                                                <IonCol size="12" sizeMd="6">
                                                                    <IonLabel>
                                                                        <strong>Visit Number:</strong> {visit.postnatal_visit_num}
                                                                    </IonLabel>
                                                                </IonCol>
                                                                <IonCol size="12" sizeMd="6">
                                                                    <IonLabel>
                                                                        <strong>Visit Date:</strong> {formatDate(visit.postnatal_visit_date)}
                                                                    </IonLabel>
                                                                </IonCol>
                                                            </IonRow>
                                                            <IonRow style={{ marginTop: '10px' }}>
                                                                <IonCol size="12" sizeMd="6">
                                                                    <IonLabel>
                                                                        <strong>Next Schedule:</strong> {formatDate(visit.postnatal_next_sched)}
                                                                    </IonLabel>
                                                                </IonCol>
                                                                <IonCol size="12" sizeMd="6">
                                                                    <IonLabel>
                                                                        <strong>Care Compliance:</strong>{' '}
                                                                        <IonBadge color={
                                                                            visit.care_compliance === 'Compliant' ? 'success' :
                                                                            visit.care_compliance === 'Non-Compliant' ? 'danger' : 'warning'
                                                                        }>
                                                                            {visit.care_compliance || 'N/A'}
                                                                        </IonBadge>
                                                                    </IonLabel>
                                                                </IonCol>
                                                            </IonRow>
                                                        </>
                                                    )}
                                                </IonCardContent>
                                            </IonCard>
                                        ))}
                                    </IonGrid>
                                )}
                            </IonCardContent>
                        </IonCard>
                    </>
                ) : null}
            </IonContent>
        </IonModal>
    );
};

export default ViewHealthModal;
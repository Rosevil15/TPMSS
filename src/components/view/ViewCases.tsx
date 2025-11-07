import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonPage, IonRow, IonSpinner, IonText, IonTitle, IonToolbar, IonBadge } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClients';
import { personOutline, documentTextOutline, calendarOutline, heartOutline, peopleOutline, chatbubblesOutline } from 'ionicons/icons';

interface ViewCasesProps {
    isOpen: boolean;
    onClose: () => void;
    caseId: number | null;
}

interface CaseData {
    caseid: number;
    profileid: number;
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

interface ProfileData {
    profileid: number;
    firstName: string;
    lastName: string;
    birthdate: string;
    age: number;
    contactnum: string;
    barangay: string;
    municipality: string;
    province: string;
}

const ViewCases: React.FC<ViewCasesProps> = ({ isOpen, onClose, caseId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [caseData, setCaseData] = useState<CaseData | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    useEffect(() => {
        if (isOpen && caseId) {
            fetchCaseData();
        }
    }, [isOpen, caseId]);

    const fetchCaseData = async () => {
        if (!caseId) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch case record
            const { data: caseRecord, error: caseError } = await supabase
                .from('caseManagement')
                .select('*')
                .eq('caseid', caseId)
                .single();

            if (caseError) {
                console.error('Error fetching case data:', caseError);
                throw caseError;
            }

            setCaseData(caseRecord);

            // Fetch profile data
            if (caseRecord?.profileid) {
                const { data: profile, error: profileError } = await supabase
                    .from('profile')
                    .select('*')
                    .eq('profileid', caseRecord.profileid)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile data:', profileError);
                    throw profileError;
                }

                setProfileData(profile);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const getReceivedColor = (received: string) => {
        switch (received?.toLowerCase()) {
            case 'yes':
                return 'success';
            case 'no':
                return 'danger';
            default:
                return 'medium';
        }
    };

    const InfoRow = ({ label, value, icon }: { label: string; value: string | number; icon?: string }) => (
        <IonRow className="ion-align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
            <IonCol size="12" sizeMd="4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon && <IonIcon icon={icon} style={{ color: '#002d54', fontSize: '18px' }} />}
                    <IonText style={{ fontWeight: 'bold', color: '#555' }}>{label}</IonText>
                </div>
            </IonCol>
            <IonCol size="12" sizeMd="8">
                <IonText style={{ color: '#000' }}>{value || 'N/A'}</IonText>
            </IonCol>
        </IonRow>
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
                        Case Record Details
                    </IonTitle>

                    <IonButton
                        slot="end"
                        onClick={onClose}
                        style={{
                            '--background': '#fff',
                            '--color': '#000000',
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
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <IonSpinner name="crescent" />
                    </div>
                ) : error ? (
                    <IonCard style={{ background: '#fee', border: '1px solid #fcc' }}>
                        <IonCardContent>
                            <IonText color="danger">
                                <h3>Error Loading Data</h3>
                                <p>{error}</p>
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                ) : caseData ? (
                    <IonGrid>
                        {/* Profile Information Card */}
                        <IonCard style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <IonCardContent>
                                <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                    Personal Information
                                </h2>
                                <IonGrid>
                                    <InfoRow 
                                        label="Full Name" 
                                        value={`${profileData?.firstName || ''} ${profileData?.lastName || ''}`}
                                        icon={personOutline}
                                    />
                                    <InfoRow 
                                        label="Profile ID" 
                                        value={profileData?.profileid || 'N/A'}
                                    />
                                    <InfoRow 
                                        label="Age" 
                                        value={profileData?.age || 'N/A'}
                                    />
                                    <InfoRow 
                                        label="Contact Number" 
                                        value={profileData?.contactnum || 'N/A'}
                                    />
                                    <InfoRow 
                                        label="Address" 
                                        value={`${profileData?.barangay || ''}, ${profileData?.municipality || ''}, ${profileData?.province || ''}`}
                                    />
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>

                        {/* Case Information Card */}
                        <IonCard style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <IonCardContent>
                                <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                    Case Information
                                </h2>
                                <IonGrid>
                                    <InfoRow 
                                        label="Case ID" 
                                        value={caseData.caseid}
                                        icon={documentTextOutline}
                                    />
                                    <InfoRow 
                                        label="Created By" 
                                        value={caseData.case_created_by}
                                        icon={personOutline}
                                    />
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>

                        {/* Guidance Counseling Card */}
                        <IonCard style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <IonCardContent>
                                <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                    Guidance Counseling
                                </h2>
                                <IonGrid>
                                    {/* Received GC with Badge */}
                                    <IonRow className="ion-align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
                                        <IonCol size="12" sizeMd="4">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <IonIcon icon={chatbubblesOutline} style={{ color: '#002d54', fontSize: '18px' }} />
                                                <IonText style={{ fontWeight: 'bold', color: '#555' }}>Received Guidance?</IonText>
                                            </div>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="8">
                                            <IonBadge color={getReceivedColor(caseData.received_GC)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                                                {caseData.received_GC || 'N/A'}
                                            </IonBadge>
                                        </IonCol>
                                    </IonRow>

                                    {caseData.received_GC?.toLowerCase() === 'yes' && (
                                        <>
                                            <InfoRow 
                                                label="Type of Guidance" 
                                                value={caseData.guidance_type}
                                            />
                                            <InfoRow 
                                                label="Received From" 
                                                value={caseData.guid_received_from}
                                            />
                                            <InfoRow 
                                                label="Frequency" 
                                                value={caseData.guidance_frequency}
                                                icon={calendarOutline}
                                            />
                                        </>
                                    )}
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>

                        {/* Family Support Card */}
                        <IonCard style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <IonCardContent>
                                <h2 style={{ color: "black", fontWeight: "bold", backgroundColor: '#fff', padding: '10px', fontSize: '1.5rem', borderBottom: '2px solid #002d54' }}>
                                    Family Support
                                </h2>
                                <IonGrid>
                                    {/* Received FS with Badge */}
                                    <IonRow className="ion-align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
                                        <IonCol size="12" sizeMd="4">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <IonIcon icon={peopleOutline} style={{ color: '#002d54', fontSize: '18px' }} />
                                                <IonText style={{ fontWeight: 'bold', color: '#555' }}>Received Support?</IonText>
                                            </div>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="8">
                                            <IonBadge color={getReceivedColor(caseData.received_FS)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                                                {caseData.received_FS || 'N/A'}
                                            </IonBadge>
                                        </IonCol>
                                    </IonRow>

                                    {caseData.received_FS?.toLowerCase() === 'yes' && (
                                        <>
                                            <InfoRow 
                                                label="Type of Support" 
                                                value={caseData.family_support_type}
                                            />
                                            <InfoRow 
                                                label="Received From" 
                                                value={caseData.fam_sup_received_from}
                                            />
                                            <InfoRow 
                                                label="Frequency" 
                                                value={caseData.family_support_frequency}
                                                icon={calendarOutline}
                                            />
                                        </>
                                    )}
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>

                        {/* Alert Cards based on received services */}
                        {caseData.received_GC?.toLowerCase() === 'no' && caseData.received_FS?.toLowerCase() === 'no' && (
                            <IonCard style={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
                                <IonCardContent>
                                    <IonText color="warning">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <IonIcon icon={heartOutline} style={{ fontSize: '24px' }} />
                                            <div>
                                                <strong>No Services Received</strong>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                                                    This individual has not received any guidance counseling or family support. Follow-up may be needed.
                                                </p>
                                            </div>
                                        </div>
                                    </IonText>
                                </IonCardContent>
                            </IonCard>
                        )}

                        {(caseData.received_GC?.toLowerCase() === 'yes' || caseData.received_FS?.toLowerCase() === 'yes') && (
                            <IonCard style={{ background: '#d4edda', border: '1px solid #28a745' }}>
                                <IonCardContent>
                                    <IonText color="success">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <IonIcon icon={heartOutline} style={{ fontSize: '24px' }} />
                                            <div>
                                                <strong>Active Support</strong>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                                                    This individual is receiving support services. Continue monitoring progress.
                                                </p>
                                            </div>
                                        </div>
                                    </IonText>
                                </IonCardContent>
                            </IonCard>
                        )}
                    </IonGrid>
                ) : (
                    <IonCard>
                        <IonCardContent>
                            <IonText color="medium">
                                <p style={{ textAlign: 'center' }}>No case data available</p>
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                )}
            </IonContent>
        </IonModal>
    );
};

export default ViewCases;
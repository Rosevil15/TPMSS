import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonModal, IonPage, IonRow, IonSearchbar, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToast, IonToolbar, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { addOutline, logoIonic, searchOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClients';
import AddHealthRecord from '../../../components/AddHealthRecord';
import ViewHealthModal from '../../../components/view/ViewHealthModal';
import AddChildHealthRecord from '../../../components/AddChilHealthdRecord';
import AddPrenatalPostnatal from '../../../components/AddPrenatalpostnal';

interface HealthMonitoring {
    health_id: number;
    profileid: number;
    medical_history: string;
    pregnancy_status: string;
    stage_of_pregnancy: string;
    num_of_pregnancies: number;
    tentanus_vacc: boolean;
    tetanus_dose: number;
    date_of_last_mens_period: string;
    height: number;
    weight: number;
    temperature: number;
    firstName?: string;
    lastName?: string;
};

interface HealthMonitoringProps {
    searchQuery?: string;
}

const HealthMonitoring: React.FC<HealthMonitoringProps> = ({ searchQuery = '' }) => {
    const [health, setHealth] = useState<HealthMonitoring[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingHealth, setEditingHealth] = useState<HealthMonitoring | null>();
    const [isEditing, setIsEditing] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedHealthID, setSelectedHealthID] = useState<number | null>(null);
    const [showAddChildModal, setShowAddChildModal] = useState(false);
    const [showAddPrenatalModal, setShowAddPrenatalModal] = useState(false);

     // Reset loading state 
    useIonViewWillEnter(() => {
        //console.log("HealthMonitoring view entered");
        setLoading(true);
        fetchHealthData();
        setHasFetched(true);
    });

    const fetchHealthData = async () => {
        try {
            const {data, error} =await supabase 
            .from('maternalhealthRecord')
            .select(`
                health_id,
                profileid,
                medical_history,
                pregnancy_status,
                stage_of_pregnancy,
                num_of_pregnancies,
                tentanus_vacc,
                tetanus_dose,
                date_of_last_mens_period,
                height,
                weight,
                temperature,
                profile:profileid (
                    firstName,
                    lastName
                )
            `);
        
            if (error) {
                setError('Error fetching health data');
                setShowToast(true);
                setToastMessage('Error fetching health data');
            }

            if (data) {
                const formattedData = data.map((item: any) => ({
                    ...item,
                    firstName: item.profile?.firstName || '',
                    lastName: item.profile?.lastName || '',
                }));
                setHealth(formattedData);
            }
        } catch (error) {
            console.error('Error fetching health data:', error);
            setError('Error fetching health data');
            setShowToast(true);
            setToastMessage('Error fetching health data');
        } finally {
            setLoading(false);
        }
    };

    const filteredHealth = health.filter(record => {
        if (!searchQuery) return true;
        const fullName = `${record.firstName} ${record.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

        const handleViewHealth = (healthId: number) => {
        setSelectedHealthID(healthId);
        setShowViewModal(true);
    };


    if (loading) {
        return (
            <IonPage>
                <IonContent style={{ '--background': '#ffffffff' }}>
                    <div className="ion-padding">
                        <div className="ion-margin-bottom ion-margin-top">
                            <IonSkeletonText animated style={{ width: '200px', height: '44px', borderRadius: '12px' }} />
                        </div>

                        <IonGrid>
                            {[1, 2, 3, 4].map((item) => (
                                <IonCard key={item} style={{ border: "1px solid #ddd", marginBottom: '15px' }}>
                                    <IonCardContent>
                                        <IonGrid>
                                            <IonRow>
                                                <IonCol size="12" size-md="4">
                                                    <IonSkeletonText animated style={{ width: '40%', height: '12px', marginBottom: '5px' }} />
                                                    <IonSkeletonText animated style={{ width: '80%', height: '16px' }} />
                                                </IonCol>
                                                <IonCol size="12" size-md="4">
                                                    <IonSkeletonText animated style={{ width: '50%', height: '12px', marginBottom: '5px' }} />
                                                    <IonSkeletonText animated style={{ width: '70%', height: '16px' }} />
                                                </IonCol>
                                                <IonCol size="12" size-md="4">
                                                    <IonSkeletonText animated style={{ width: '60%', height: '12px', marginBottom: '5px' }} />
                                                    <IonSkeletonText animated style={{ width: '75%', height: '16px' }} />
                                                </IonCol>
                                            </IonRow>
                                            <IonRow style={{ marginTop: '10px' }}>
                                                <IonCol size="6">
                                                    <IonSkeletonText animated style={{ width: '90px', height: '36px', borderRadius: '8px' }} />
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonCardContent>
                                </IonCard>
                            ))}
                        </IonGrid>
                    </div>
                </IonContent>
            </IonPage>
        );
    }
    
    
    return (
        <IonPage>
            <IonContent style={{ '--background': '#ffffffff' }}>
                <IonGrid className="ion-padding">
                    <IonRow className="ion-margin-bottom ion-margin-top ion-align-items-center">
                        {/* Button for adding health records */}
                        <IonCol size="12" sizeMd="5">
                            
                            <IonButton
                                
                                onClick={() => {
                                    setShowAddModal(true);
                                    setIsEditing(false);
                                    setEditingHealth(null);
                                }}
                                style={{
                                    '--background': '#002d54',
                                    color: 'white',
                                    borderRadius: '12px',
                                }}
                            >
                                <IonIcon icon={addOutline} slot="start" />
                                Add Health Record
                            </IonButton>
                        </IonCol>
                            {/* Button for adding childrecords */}
                        <IonCol size="12" sizeMd="4" >
                            
                            <IonButton
                                
                                onClick={() => {
                                    setShowAddChildModal(true);
                                    setIsEditing(false);
                                    setEditingHealth(null);
                                }}
                                style={{
                                    '--background': '#002d54',
                                    color: 'white',
                                    borderRadius: '12px',
                                    
                                }}
                            >
                                <IonIcon icon={addOutline} slot="start" />
                                Add Child Record
                            </IonButton>
                        </IonCol>
                        {/* Button for adding  prenatal/postnatal */}
                        <IonCol size="12" sizeMd="3" >
                           
                            <IonButton
                                
                                onClick={() => {
                                    setShowAddPrenatalModal(true);
                                    setIsEditing(false);
                                    setEditingHealth(null);
                                }}
                                style={{
                                    '--background': '#002d54',
                                    color: 'white',
                                    borderRadius: '12px',
                                }}
                            >
                                <IonIcon icon={addOutline} slot="start" />
                                Add Postnatal/Prenatal
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    

                    {error && (
                        <div className="ion-margin-bottom ion-color-danger">
                            <IonText color="danger">{error}</IonText>
                        </div>
                    )}

                    <IonGrid>
                        <IonCard style={{ border: "1px solid #000", '--background': '#ffffffff' }}>
                            <IonCardContent>
                                <IonGrid style={{ "--ion-grid-column-padding": "8px" }}>
                                    {/* Table Header */}
                                    <IonRow
                                        style={{
                                            borderBottom: "1px solid #000",
                                            fontWeight: "bold",
                                            color: "#000",
                                            textAlign: "center",
                                        }}
                                    >
                                        <IonCol size="12" sizeMd="3">Name</IonCol>
                                        <IonCol size="6" sizeMd="2" className="ion-hide-md-down">Pregnancy Status</IonCol>
                                        <IonCol size="6" sizeMd="2" className="ion-hide-md-down">Stage</IonCol>
                                        <IonCol size="12" sizeMd="2" className="ion-hide-md-down">Medical History</IonCol>
                                        <IonCol size="12" sizeMd="3">Action</IonCol>
                                    </IonRow>

                                    {/* Table Data */}
                                    {filteredHealth.length === 0 ? (
                                        <IonRow>
                                            <IonCol style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                No health records found
                                            </IonCol>
                                        </IonRow>
                                    ) : (
                                        filteredHealth.map((healthRecord, index) => (
                                            <IonRow 
                                                key={healthRecord.health_id} 
                                                style={{ 
                                                    borderBottom: index < filteredHealth.length - 1 ? "1px solid #ccc" : "none",
                                                    color: "#000",
                                                    textAlign: "center",
                                                }}
                                                className="ion-align-items-center"
                                            >
                                                <IonCol size="12" sizeMd="3">
                                                    {healthRecord.firstName || "No Name"} {healthRecord.lastName || ""}
                                                    <pre style={{ fontSize: '10px', color: 'black' }}>
                                                        ID: {healthRecord.profileid}
                                                    </pre>
                                                    {/* Mobile-only info */}
                                                    <div className="ion-hide-md-up" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                        <div><strong>Status:</strong> {healthRecord.pregnancy_status || 'N/A'}</div>
                                                        <div><strong>Stage:</strong> {healthRecord.stage_of_pregnancy || 'N/A'}</div>
                                                    </div>
                                                </IonCol>
                                                
                                                {/* Desktop-only columns */}
                                                <IonCol size="6" sizeMd="2" className="ion-hide-md-down">
                                                    {healthRecord.pregnancy_status || 'N/A'}
                                                </IonCol>
                                                <IonCol size="6" sizeMd="2" className="ion-hide-md-down">
                                                    {healthRecord.stage_of_pregnancy || 'N/A'}
                                                </IonCol>
                                                <IonCol size="12" sizeMd="2" className="ion-hide-md-down">
                                                    <div style={{ 
                                                        maxWidth: '200px', 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        margin: '0 auto'
                                                    }}>
                                                        {healthRecord.medical_history || 'None'}
                                                    </div>
                                                </IonCol>

                                                <IonCol size="12" sizeMd="3">
                                                    <IonButton
                                                        size="small"
                                                        fill="outline"
                                                        color="black"
                                                        style={{
                                                            color: "#000",
                                                            marginRight: "5px",
                                                        }}
                                                        onClick={() => handleViewHealth(healthRecord.health_id)}
                                                    >
                                                        View
                                                    </IonButton>
                                                    <IonButton
                                                        size="small"
                                                        fill="outline"
                                                        style={{ marginRight: "5px" }}
                                                        onClick={() => {
                                                            setShowAddModal(true);
                                                            setIsEditing(true);
                                                            setEditingHealth(healthRecord);
                                                        }}
                                                    >
                                                        Edit
                                                    </IonButton>
                                                </IonCol>
                                            </IonRow>
                                        ))
                                    )}
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>
                    </IonGrid>
                </IonGrid>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                    position="bottom"
                />

                <AddHealthRecord 
                    isOpen={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setIsEditing(false);
                        setEditingHealth(null);
                    }}
                    onSave={async (record: any) => {
                        await fetchHealthData();
                        setShowAddModal(false);
                        setIsEditing(false);
                        setEditingHealth(null);
                        setToastMessage(isEditing ? 'Health record updated successfully!' : 'Health record saved successfully!');
                        setShowToast(true);
                    }}
                    isEditing={isEditing}
                    editingHealth={editingHealth}
                />

                <ViewHealthModal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedHealthID(null);
                    }}
                    healthID={selectedHealthID}
                />

                <AddChildHealthRecord
                    isOpen={showAddChildModal}
                    onClose={() => setShowAddChildModal(false)}
                    onSave={async (record: any) => {
                        await fetchHealthData();
                        setShowAddChildModal(false);
                        setToastMessage('Child health record saved successfully!');
                        setShowToast(true);
                    }}
                />

                <AddPrenatalPostnatal
                    isOpen={showAddPrenatalModal}
                    onClose={() => setShowAddPrenatalModal(false)}
                    onSave={async (record: any) => {
                        setShowAddPrenatalModal(false);
                        setToastMessage('Prenatal/Postnatal visit record saved successfully!');
                        setShowToast(true);
                    }}
                />
            </IonContent>
        </IonPage>
    );
};

export default HealthMonitoring;
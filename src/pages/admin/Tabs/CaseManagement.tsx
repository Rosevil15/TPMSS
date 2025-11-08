import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import React, { use } from 'react';
import { supabase } from '../../../utils/supabaseClients';
import { addOutline } from 'ionicons/icons';
import AddCaseModal from '../../../components/AddCaseModal';
import ViewCases from '../../../components/view/ViewCases';

interface Case {
    caseid: number;
    profileid: number;
    guid_received_from: string;
    guidance_type: string;
    guidance_frequency: string;
    fam_sup_received_from : string;
    family_support_type : string;
    family_support_frequency : string;
    received_GC : string;
    received_FS : string;
    firstName?: string;
    lastName?: string;
    social_support_type: string;
    social_sup_received_from: string;
    social_sup_frequency: string;
    received_PS: string;
    partner_support_type: string;
    partner_support_frequency: string;

};

interface CaseManagementProps {
    searchQuery?: string;
    
}

const CaseManagement: React.FC<CaseManagementProps> = ({ searchQuery = '' }) => {
    const [cases, setCases] = React.useState<Case[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | undefined>();
    const [toastMessage, setToastMessage] = React.useState('');
    const [showToast, setShowToast] = React.useState(false);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [editingCase, setEditingCase] = React.useState<Case | null>();
    const [isEditing, setIsEditing] = React.useState(false);
    const [hasFetched, setHasFetched] = React.useState(false);
    const [showViewModal, setShowViewModal] = React.useState(false);
    const [viewingCaseId, setViewingCaseId] = React.useState<number | null>(null);

    useIonViewWillEnter(() => {
       // console.log("CaseManagement view entered");
        setLoading(true);
        fetchCases(); 
        setHasFetched(true);
    });

    const fetchCases = async () => {
        try {
            const {data, error} = await supabase
                .from('caseManagement')
                .select(`
                    caseid,
                    profileid,
                    guid_received_from,
                    guidance_type,
                    guidance_frequency,
                    fam_sup_received_from,
                    family_support_type,
                    family_support_frequency,
                    received_GC,
                    received_FS,
                    received_SS,
                    social_support_type,
                    social_sup_received_from,
                    social_sup_frequency,
                    received_PS,
                    partner_support_type,
                    partner_support_frequency,
                    profile:profileid (
                        firstName,
                        lastName
                    )
                    `); 

                if (error) {
                    setError(error.message);
                    setToastMessage('Error fetching cases');
                    setShowToast(true);
                }
                if (data) {
                    const formatted = data.map((item:any) => ({
                        ...item,
                        firstName: item.profile?.firstName || '',
                        lastName: item.profile?.lastName || '',
                    }));
                    setCases(formatted);
                }
        }
        catch (error) {
            setError('An unexpected error occurred');
            setToastMessage('An unexpected error occurred');
            setShowToast(true);
        }
        finally {
            setLoading(false);
        }
    };

    const filteredCases = cases.filter(record => {
        const fullName = `${record.firstName} ${record.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const handleViewProfile = (caseId: number) => {
        setViewingCaseId(caseId);
        setShowViewModal(true);
    };

    {/* rendering based on loading state */}
    if (loading) {
        return (
            <IonPage>
                <IonContent style={{ '--background': '#ffffffff' }}>
                    <div className="ion-padding">
                        <div className="ion-margin-bottom ion-margin-top">
                            <IonSkeletonText animated style={{ width: '160px', height: '44px', borderRadius: '12px' }} />
                        </div>

                        <IonCard style={{ border: "1px solid #000" }}>
                            <IonCardContent>
                                <IonGrid style={{ "--ion-grid-column-padding": "8px" }}>
                                    {/* Header Skeleton */}
                                    <IonRow style={{ borderBottom: "1px solid #000", paddingBottom: '10px' }}>
                                        <IonCol size="4"><IonSkeletonText animated style={{ width: '60%', height: '16px' }} /></IonCol>
                                        <IonCol size="4"><IonSkeletonText animated style={{ width: '70%', height: '16px' }} /></IonCol>
                                        <IonCol size="4"><IonSkeletonText animated style={{ width: '65%', height: '16px' }} /></IonCol>
                                    </IonRow>

                                    {/* Row Skeletons */}
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <IonRow key={item} style={{ borderBottom: item < 5 ? "1px solid #ccc" : "none", padding: '12px 0' }}>
                                            <IonCol size="4"><IonSkeletonText animated style={{ width: '80%', height: '14px' }} /></IonCol>
                                            <IonCol size="4"><IonSkeletonText animated style={{ width: '70%', height: '14px' }} /></IonCol>
                                            <IonCol size="4"><IonSkeletonText animated style={{ width: '75%', height: '14px' }} /></IonCol>
                                        </IonRow>
                                    ))}
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent style={{ '--background': '#ffffffff' }}>
                <IonGrid className="ion-padding">
                    <IonRow className="ion-margin-bottom ion-margin-top">
                        <IonCol size="12" sizeMd="6" sizeLg="4">
                            {/* Button for adding cases */}
                            <IonButton
                                className="ion-margin-end"
                                onClick={() => {
                                    setShowAddModal(true);
                                    setIsEditing(false);
                                    setEditingCase(null);
                                }}
                                style={{
                                    '--background': '#002d54',
                                    color: 'white',
                                    borderRadius: '12px',
                                }}
                            >
                                <IonIcon icon={addOutline} slot="start" />
                                Add Case Record
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    {error && (
                        <div className="ion-margin-bottom ion-color-danger">
                            <IonText color="danger">{error}</IonText>
                        </div>
                    )}

                    <IonGrid>
                        <IonCard style={{ border: "1px solid #000",'--background':'#ffffffff' }}>
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
                                        <IonCol size="12" sizeMd="5">Name</IonCol>
                                        <IonCol size="6" sizeMd="2" className="ion-hide-md-down" >Guidance and Counseling</IonCol>
                                        <IonCol size="6" sizeMd="2" className="ion-hide-md-down">Family Support</IonCol>
                                        <IonCol size="12" sizeMd="3">Action</IonCol>
                                    </IonRow>

                                    {/* Table Rows */}
                                    {filteredCases.length === 0 ? (
                                        <IonRow>
                                            <IonCol style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                No case records found
                                            </IonCol>
                                        </IonRow>
                                    ) : (
                                        filteredCases.map((caseItem, index) => (
                                            <IonRow
                                                key={caseItem.caseid}
                                                style={{
                                                    borderBottom: index < filteredCases.length - 1 ? "1px solid #ccc" : "none",
                                                    color: "#000",
                                                    textAlign: "center",
                                                }}
                                                className="ion-align-items-center"
                                            >
                                                <IonCol size="12" sizeMd="5">
                                                    {caseItem.firstName || "No Name"} {caseItem.lastName || ""}
                                                    <pre style={{ fontSize: '10px', color: 'black' }}>
                                                        ID: {caseItem.profileid}
                                                    </pre>
                                                    {/* Mobile-only info */}
                                                    <div className="ion-hide-md-up" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                        <div><strong>Guidance and Counseling:</strong> {caseItem.received_GC || 'N/A'}</div><div><strong>Family Support:</strong> {caseItem.received_FS || 'N/A'}</div>
                                                    </div>
                                                </IonCol>
                                                
                                                {/* Desktop-only column */}
                                                <IonCol size="6" sizeMd="2" className="ion-hide-md-down">
                                                    {caseItem.received_GC || "N/A"}
                                                </IonCol>

                                                <IonCol size="6" sizeMd="2" className="ion-hide-md-down">
                                                    {caseItem.received_FS || "N/A"}
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
                                                        onClick={() => handleViewProfile(caseItem.caseid)}
                                                    >
                                                        View
                                                    </IonButton>
                                                    <IonButton
                                                        size="small"
                                                        fill="outline"
                                                        style={{ marginRight: "5px" 
                                                        }}
                                                        onClick={() => {
                                                            setIsEditing(true);
                                                            setEditingCase(caseItem);
                                                            setShowAddModal(true);
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
               
                <AddCaseModal
                    isOpen={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setIsEditing(false);
                        setEditingCase(null);
                    }}
                    onSave={async (record:any) => {
                        await fetchCases();
                        setShowAddModal(false);
                        setIsEditing(false);
                        setEditingCase(null);
                        setToastMessage(isEditing ? 'Case updated successfully!' : 'Case added successfully!');
                        setShowToast(true);
                    }}
                    editingCase={editingCase}
                    isEditing={isEditing}
                />

                <ViewCases
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setViewingCaseId(null);
                    }}
                    caseId={viewingCaseId}
                />
            </IonContent>
        </IonPage>
    );
};

export default CaseManagement;
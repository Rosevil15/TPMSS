import { IonBadge, IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClients';
import { addOutline, alertCircleOutline, cloudUploadOutline, documentAttach, text, warningOutline } from 'ionicons/icons';
import AddProfileModal from '../../../components/AddProfileModal';
import { useIonViewWillEnter } from '@ionic/react';
import ViewProfileModal from '../../../components/view/ViewProfileModal';
import { EarlyWarningCase, fetchEarlyWarnings } from '../../../services/earlyWarning';

interface ProfileManagementProps {
    searchQuery?: string;
}

interface Profile {
    profileid: number;
    firstName: string;
    lastName: string;
    birthdate: string;
    age: number;
    contactnum: string;
    barangay: string;
    municipality: string;
    province: string;
    zipcode: string;
    createdAt: string;
  
};
const ProfileManagement: React.FC<ProfileManagementProps> = ({ searchQuery = '' }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState < Profile | null > ();
    const [isEditing, setIsEditing] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
    const [earlyWarnings, setEarlyWarnings] = useState<Map<number, EarlyWarningCase>>(new Map());

    // Reset loading state 
    useIonViewWillEnter(() => {
        //console.log("ProfileManagement view entered");
        setLoading(true);
        loadData(); 
        setHasFetched(true);
    });

    const filteredProfiles = profiles.filter(profile => {
        if (!searchQuery) return true;
        const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const loadData = async () => {
        try {
            await fetchProfiles();
            await loadEarlyWarning();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const fetchProfiles = async () => {
        try {
            const {data, error} = await supabase
                .from('profile')
                .select('*'); 

                if (error) {
                    setError(error.message);
                    setToastMessage('Error fetching profiles');
                    setShowToast(true);
                }
                if (data) {
                   // console.log("Fetched profiles:", data);
                    setProfiles(data);
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

    const loadEarlyWarning = async () => {
        try {
            const locationFilter = {
                filterType: 'all' as const,
                region: '',
                province: '',
                municipality: '',
                barangay: ''
            };
            
            const { warnings } = await fetchEarlyWarnings(locationFilter);

            const warningMap = new Map<number, EarlyWarningCase>();
            warnings.forEach(warning => {
                warningMap.set(warning.profileid, warning);
            });

            setEarlyWarnings(warningMap);
        } catch (error) {
            console.error("Error fetching early warnings:", error);
        }
    };

    const handleViewProfile = (profileId: number) => {
        setSelectedProfileId(profileId);
        setShowViewModal(true);
    };

    const getWarningForProfile = (profileId: number) => {
        return earlyWarnings.get(profileId);
    };
        
    {/* rendering based on loading state */}
    if (loading) {
        return (
            <IonPage>
                <IonContent style={{ '--background': '#ffffffff' }}>
                    <IonGrid className="ion-padding">
                        <IonRow className="ion-margin-bottom ion-margin-top">
                            <IonCol size="12" size-md="6" size-lg="4">
                                <IonSkeletonText animated style={{ width: '180px', height: '44px', borderRadius: '12px' }} />
                            </IonCol>
                        </IonRow>

                        <IonCard style={{ border: "1px solid #000" }}>
                            <IonCardContent>
                                <IonGrid style={{ "--ion-grid-column-padding": "8px" }}>
                                    {/* Table Header Skeleton */}
                                    <IonRow style={{ borderBottom: "1px solid #000", paddingBottom: '10px' }}>
                                        <IonCol size="12" size-md="5">
                                            <IonSkeletonText animated style={{ width: '60%', height: '16px' }} />
                                        </IonCol>
                                        <IonCol size="12" size-md="4">
                                            <IonSkeletonText animated style={{ width: '70%', height: '16px' }} />
                                        </IonCol>
                                        <IonCol size="12" size-md="3">
                                            <IonSkeletonText animated style={{ width: '50%', height: '16px' }} />
                                        </IonCol>
                                    </IonRow>

                                    {/* Table Data Skeleton */}
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                        <IonRow
                                            key={item}
                                            style={{
                                                borderBottom: item < 8 ? "1px solid #ccc" : "none",
                                                padding: '15px 0'
                                            }}
                                        >
                                            <IonCol size="12" size-md="5">
                                                <IonSkeletonText animated style={{ width: '80%', height: '14px', margin: '0 auto' }} />
                                            </IonCol>
                                            <IonCol size="12" size-md="4">
                                                <IonSkeletonText animated style={{ width: '70%', height: '14px', margin: '0 auto' }} />
                                            </IonCol>
                                            <IonCol size="12" size-md="3">
                                                <IonSkeletonText animated style={{ width: '100px', height: '32px', borderRadius: '8px', margin: '0 auto' }} />
                                            </IonCol>
                                        </IonRow>
                                    ))}
                                </IonGrid>
                            </IonCardContent>
                        </IonCard>
                    </IonGrid>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent style={{ '--background': '#ffffffff' }}>
                <IonGrid className="ion-padding">
                    {/* Early Warning Summary */}
                    {earlyWarnings.size > 0 && (
                        <IonRow className="ion-margin-bottom">
                            <IonCol size="12">
                                <IonCard style={{ borderLeft: '4px solid #e74c3c', '--background': '#fee', alignItems: 'center', }}>
                                    <IonCardContent>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <IonIcon icon={warningOutline} style={{ fontSize: '24px', color: '#e74c3c' }} />
                                            <div>
                                                <IonText style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>
                                                    Early Warning Alerts
                                                </IonText>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
                                                    {earlyWarnings.size} profile(s) flagged for risk of repeated pregnancy or school dropout
                                                </p>
                                            </div>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    )}
                        <IonRow className="ion-margin-bottom ion-margin-top">
                            <IonCol size="12" size-md="6" size-lg="4">
                                {/*Button for adding profiles */}
                                <IonButton
                                    className="ion-margin-end"
                                    onClick={() => {
                                        setShowAddModal(true);
                                        setIsEditing(false);
                                        setEditingProfile(null);
                                    }}
                                    style={{
                                        '--background': '#002d54',
                                        color: 'white',
                                        borderRadius: '12px',
                                    }}
                                >
                                    <IonIcon icon={addOutline} slot="start" />
                                    Register Profile
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
                                            <IonCol size="12" size-md="5">Name</IonCol>
                                            <IonCol size="12" size-md="4">Date Registered</IonCol>
                                            <IonCol size="12" size-md="3">Action</IonCol>
                                        </IonRow>

                                        {/* Table Data */}
                                        {filteredProfiles.length === 0 ? (
                                            <IonRow>
                                                <IonCol style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                    {searchQuery ? 'No matching profiles found' : 'No profiles found'}
                                                </IonCol>
                                            </IonRow>
                                        ) : (
                                                
                                        filteredProfiles.map((profile, index) => {
                                            const warning = getWarningForProfile(profile.profileid);
                                            return (
                                                <IonRow
                                                key={index}
                                                style={{
                                                    borderBottom:
                                                    index < filteredProfiles.length - 1
                                                        ? "1px solid #ccc"
                                                        : "none",
                                                    color: "#000",
                                                    textAlign: "center",
                                                }}
                                                className="ion-align-items-center"
                                                >
                                                <IonCol size="12" size-md="5">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        {warning && warning.riskLevel === 'high' && (
                                                            <IonIcon icon={alertCircleOutline} style={{ color: '#e74c3c', fontSize: '18px' }} />
                                                        )}
                                                        {warning && warning.riskLevel === 'medium' && (
                                                            <IonIcon icon={warningOutline} style={{ color: '#f39c12', fontSize: '18px' }} />
                                                        )}
                                                        <div>
                                                            {profile.firstName || "No Name"} {profile.lastName || ""}
                                                            <pre style={{ fontSize: '10px', color: 'black', margin: '2px 0' }}>
                                                                ID: {profile.profileid}
                                                            </pre>
                                                            {warning && (
                                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                                                                    {warning.repeatedPregnancy && (
                                                                        <IonBadge color="warning" style={{ fontSize: '9px' }}>
                                                                            {warning.pregnancyCount}x Pregnancy
                                                                        </IonBadge>
                                                                    )}
                                                                    {warning.schoolDropout && (
                                                                        <IonBadge color="primary" style={{ fontSize: '9px' }}>
                                                                            Dropout
                                                                        </IonBadge>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </IonCol>

                                                <IonCol size="12" size-md="4">
                                                    {profile.createdAt || "-"}
                                                </IonCol>
                                                <IonCol size='12' size-md='3'>
                                                    <IonButton
                                                    size="small"
                                                    fill="outline"
                                                    color="black"
                                                    style={{ color: "#000",marginRight: "5px",}}
                                                    onClick={() => handleViewProfile(profile.profileid)}
                                                    >
                                                    View
                                                    </IonButton>
                                                    <IonButton
                                                    size="small"
                                                    fill="outline"
                                                    style={{ marginRight: "5px" }}
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setEditingProfile(profile);
                                                        setShowAddModal(true);
                                                    }}
                                                    >
                                                        Edit
                                                    </IonButton>
                                                </IonCol>
                                                </IonRow>
                                            );
                                        })
                                        )}
                                    </IonGrid>
                                </IonCardContent>
                            </IonCard>
                        </IonGrid>
                </IonGrid>

                <IonToast
                    isOpen = {showToast}
                    onDidDismiss = {() => setShowToast(false)}
                    message = {toastMessage}
                    duration = {3000}
                    position = "bottom"
                />

                <AddProfileModal 
                    isOpen={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setIsEditing(false);
                        setEditingProfile(null);
                    }}
                    onSave={async (profileData) => {
                        //console.log("Saved profile:", profileData);
                        await loadData(); 
                        setToastMessage(isEditing ? 'Profile updated successfully!' : 'Profile added successfully!');
                        setShowToast(true);
                        setIsEditing(false);
                        setEditingProfile(null);
                    }}
                    editingProfile={editingProfile}
                    isEditing={isEditing}
                />
                <ViewProfileModal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedProfileId(null);
                    }}
                    profileId={selectedProfileId}
                />
            </IonContent>
        </IonPage>
    );
};

export default ProfileManagement;
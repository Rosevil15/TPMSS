import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToast, IonToolbar, useIonViewDidEnter, useIonViewWillEnter } from '@ionic/react';
import React, { use, useState } from 'react';
import { supabase } from '../../../utils/supabaseClients';
import { addOutline } from 'ionicons/icons';
import AddUserModal from '../../../components/AddUserModal';

interface UserManagementProps {
    searchQuery?: string;
}
const UserManagement: React.FC<UserManagementProps> = ({ searchQuery = '' }) => {
    const [users,setUsers] =useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useIonViewWillEnter(() => {
        //console.log("UserManagement view entered");
        setLoading(true);
        fetchUsers();
    });
    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('userid', { ascending: true });

            if (error) {
                setError(error.message);
                setToastMessage('Error fetching users');
                setShowToast(true);
            }
            if (data) {
                //console.log("Fetched users:", data);
                setUsers(data);
            }
        } catch (error) {
            setError('An unexpected error occurred');
            setToastMessage('An unexpected error occurred');
            setShowToast(true); 
        }
        finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId: number, currentStatus: boolean) => {
        try {
            setUpdatingUserId(userId);
            
            console.log('Attempting to update user:', userId);
            console.log('Current status:', currentStatus);
            console.log('New status will be:', !currentStatus);
            
            const { data, error } = await supabase
                .from('users')
                .update({ active: !currentStatus })
                .eq('userid', userId)
                .select();

            console.log('Update response - data:', data);
            console.log('Update response - error:', error);

            if (error) {
                console.error('Supabase error details:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('No rows were updated. User may not exist or you may not have permission.');
            }

            // Update local state
            setUsers(users.map(user => 
                user.userid === userId 
                    ? { ...user, active: !currentStatus }
                    : user
            ));

            setToastMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            setShowToast(true);
        } catch (error: any) {
            console.error('Error updating user status:', error);
            setToastMessage('Failed to update user status: ' + (error.message || 'Unknown error'));
            setShowToast(true);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const fullName = `${user.userfirstName || ''} ${user.userlastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const username = (user.username || '').toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) ||
            email.includes(searchQuery.toLowerCase()) ||
            username.includes(searchQuery.toLowerCase());
    });

    {/* rendering based on loading state */}
    if (loading) {
        return (
            <IonPage>
                <IonContent style={{ '--background': '#ffffffff' }}>
                    <IonGrid className="ion-padding">
                        <IonRow className="ion-margin-bottom ion-margin-top">
                            <IonCol size="12" sizeMd="6" sizeLg="4">
                                <IonSkeletonText animated style={{ width: '150px', height: '44px', borderRadius: '12px' }} />
                            </IonCol>
                        </IonRow>

                        <IonCard style={{ border: "1px solid #000" }}>
                            <IonCardContent>
                                <IonGrid style={{ "--ion-grid-column-padding": "8px" }}>
                                    {/* Header Skeleton */}
                                    <IonRow style={{ borderBottom: "1px solid #000", paddingBottom: '10px' }}>
                                        <IonCol size="12" sizeMd="4">
                                            <IonSkeletonText animated style={{ width: '60%', height: '16px' }} />
                                        </IonCol>
                                        <IonCol size="12" sizeMd="3">
                                            <IonSkeletonText animated style={{ width: '50%', height: '16px' }} />
                                        </IonCol>
                                        <IonCol size="12" sizeMd="2">
                                            <IonSkeletonText animated style={{ width: '60%', height: '16px' }} />
                                        </IonCol>
                                        <IonCol size="12" sizeMd="3">
                                            <IonSkeletonText animated style={{ width: '50%', height: '16px' }} />
                                        </IonCol>
                                    </IonRow>

                                    {/* Row Skeletons */}
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                        <IonRow
                                            key={item}
                                            style={{
                                                borderBottom: item < 8 ? "1px solid #ccc" : "none",
                                                padding: '15px 0'
                                            }}
                                        >
                                            <IonCol size="12" sizeMd="4">
                                                <IonSkeletonText animated style={{ width: '75%', height: '14px', margin: '0 auto' }} />
                                            </IonCol>
                                            <IonCol size="12" sizeMd="3">
                                                <IonSkeletonText animated style={{ width: '60%', height: '14px', margin: '0 auto' }} />
                                            </IonCol>
                                            <IonCol size="12" sizeMd="2">
                                                <IonSkeletonText animated style={{ width: '70px', height: '24px', borderRadius: '12px', margin: '0 auto' }} />
                                            </IonCol>
                                            <IonCol size="12" sizeMd="3">
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
                    <IonRow className="ion-margin-bottom ion-margin-top">
                        <IonCol size="12" sizeMd="6" sizeLg="4">
                            {/*Button for adding users */}
                            <IonButton
                                className="ion-margin-end"
                                onClick={() => {
                                    setShowAddModal(true);
                                }}
                                style={{
                                    '--background': '#002d54',
                                    color: 'white',
                                    borderRadius: '12px',
                                }}
                            >
                                <IonIcon icon={addOutline} slot="start" />
                                Add User
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
                            <IonCardContent >
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
                                        <IonCol size="12" sizeMd="4">User Name</IonCol>
                                        <IonCol size="12" sizeMd="3">Role</IonCol>
                                        <IonCol size="12" sizeMd="2">Status</IonCol>
                                        <IonCol size="12" sizeMd="3">Action</IonCol>
                                    </IonRow>
                                    
                                    {/* Table Data */}
                                    {filteredUsers.length === 0 ? (
                                        <IonRow>
                                            <IonCol style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                {searchQuery ? 'No matching users found' : 'No users found'}
                                            </IonCol>
                                        </IonRow>
                                    ) : (
                                    filteredUsers.map((user,index) => (
                                        <IonRow
                                            key={index}
                                            style={{
                                                borderBottom: index < filteredUsers.length - 1 ? "1px solid #ccc" : "none",
                                                color: "#000",
                                                textAlign: "center"
                                            }}
                                            className="ion-align-items-center"
                                        >
                                            <IonCol size="12" sizeMd="4">
                                                {user.username}
                                                <pre style={{ fontSize: '10px', color: 'black', margin: '2px 0' }}>
                                                    ID: {user.userid}
                                                </pre>
                                            </IonCol>
                                            <IonCol size="12" sizeMd="3">{user.role}</IonCol>
                                            <IonCol size="12" sizeMd="2">
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: user.active ? '#d4edda' : '#f8d7da',
                                                    color: user.active ? '#155724' : '#721c24'
                                                }}>
                                                    {user.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </IonCol>
                                            <IonCol size="12" sizeMd="3">
                                                <IonButton
                                                    size="small"
                                                    fill="outline"
                                                    style={{ marginRight: "5px",}}
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setIsEditing(true);
                                                        setShowAddModal(true);
                                                    }}
                                                >
                                                    Edit
                                                </IonButton>
                                                
                                                <IonButton
                                                    size="small"
                                                    fill="solid"
                                                    color={user.active ? 'danger' : 'success'}
                                                    onClick={() => handleToggleActive(user.userid, user.active)}
                                                    disabled={updatingUserId === user.userid}
                                                >
                                                    {updatingUserId === user.userid ? (
                                                        <IonSpinner name="crescent" style={{ width: '16px', height: '16px' }} />
                                                    ) : (
                                                        user.active ? 'Deactivate' : 'Activate'
                                                    )}
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
                    isOpen = {showToast}
                    onDidDismiss = {() => setShowToast(false)}
                    message = {toastMessage}
                    duration = {3000}
                    position = "bottom"
                />

                <AddUserModal 
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={async (userData) => {
                        //console.log("Saved user:", userData);
                        await fetchUsers();
                        setToastMessage(isEditing ? 'User updated successfully' : 'User added successfully');
                        setShowToast(true);
                        setIsEditing(false);
                        setEditingUser(null);
                    }}
                    isEditing={isEditing}
                    editingUser={editingUser}
                />
            </IonContent>
        </IonPage>
    );
};

export default UserManagement;
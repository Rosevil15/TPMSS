import React from 'react';
import {
    IonButton,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonModal,
    IonText,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonList
} from '@ionic/react';
import { shieldCheckmarkOutline } from 'ionicons/icons';

interface PrivacyAgreementModalProps {
    isOpen: boolean;
    onAccept: () => void;
    canClose?: boolean;
}

const PrivacyAgreementModal: React.FC<PrivacyAgreementModalProps> = ({ 
    isOpen, 
    onAccept, 
    canClose = false 
}) => {
    const [agreed, setAgreed] = React.useState(false);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={canClose ? undefined : () => {}} canDismiss={canClose}backdropDismiss={canClose}
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Data Privacy Agreement Required</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonCard>
                    <IonCardContent>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <IonIcon 
                                icon={shieldCheckmarkOutline} 
                                style={{ fontSize: '48px', color: '#002d54' }} 
                            />
                            <h2 style={{ color: '#002d54', marginTop: '10px' }}>
                                Privacy Agreement Required
                            </h2>
                        </div>

                        <IonText>
                            <p style={{ marginBottom: '20px', color: '#666' }}>
                                Your account was created by an administrator. Before you can continue, 
                                you must agree to our Data Privacy Policy.
                            </p>

                            <h3>Data Privacy Act Compliance</h3>
                            <p>
                                In accordance with Republic Act No. 10173 (Data Privacy Act of 2012), 
                                we inform you that:
                            </p>

                            <IonList>
                                <IonItem>
                                    <IonLabel className="ion-text-wrap">
                                        <strong>Purpose:</strong> Your personal information will be collected 
                                        and processed solely for analysis purposes to improve maternal and 
                                        child health services and support programs.
                                    </IonLabel>
                                </IonItem>
                                
                                <IonItem>
                                    <IonLabel className="ion-text-wrap">
                                        <strong>Data Security:</strong> All information is 
                                        stored securely. Access is restricted to authorized personnel only.
                                    </IonLabel>
                                </IonItem>
                                
                                <IonItem>
                                    <IonLabel className="ion-text-wrap">
                                        <strong>Confidentiality:</strong> Your personal information will 
                                        not be shared with unauthorized third parties.
                                    </IonLabel>
                                </IonItem>
                                
                                <IonItem>
                                    <IonLabel className="ion-text-wrap">
                                        <strong>Your Rights:</strong> You have the right to access, 
                                        correct, or request deletion of your personal data.
                                    </IonLabel>
                                </IonItem>
                            </IonList>
                        </IonText>

                        <div style={{ marginTop: '30px', padding: '20px', border: '2px solid #002d54', borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
                            <IonItem lines="none" style={{ '--background': 'transparent' }}>
                                <IonCheckbox 
                                    checked={agreed}
                                    onIonChange={(e) => setAgreed(e.detail.checked)}
                                    slot="start"
                                    style={{ 
                                        '--checkmark-color': 'white',
                                        '--background-checked': '#002d54',
                                        '--border-color-checked': '#002d54',
                                        marginRight: '12px'
                                    }}
                                />
                                <IonLabel className="ion-text-wrap">
                                    <IonText style={{ fontWeight: 'bold' }}>
                                        I agree to the <strong style={{ color: '#002d54' }}>Data Privacy Act (RA 10173)</strong> and 
                                        understand that my personal information will be processed for analysis purposes only.
                                    </IonText>
                                </IonLabel>
                            </IonItem>
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <IonButton 
                                expand="block" 
                                onClick={() => {
                                    if (agreed) {
                                        onAccept();
                                        setAgreed(false);
                                    }
                                }}
                                disabled={!agreed}
                                style={{ 
                                    '--background': agreed ? '#002d54' : '#ccc',
                                    height: '50px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600'
                                }}
                            >
                                {agreed ? 'Accept and Continue' : 'Please check the agreement above'}
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonModal>
    );
};

export default PrivacyAgreementModal;
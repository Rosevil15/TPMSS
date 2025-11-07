import { IonAlert, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonInputPasswordToggle, IonItem, IonLabel, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import React, { use, useState } from 'react';
import { supabase } from '../utils/supabaseClients';
import bcrypt from 'bcryptjs';
import { personOutline, mailOutline, lockClosedOutline, checkmarkCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';

const AlertBox: React.FC<{ message: string; isOpen: boolean; onClose: () => void }> = ({ message, isOpen, onClose }) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Notification"
      message={message}
      buttons={['OK']}
    />
  );
};

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [FirstName, setFirstName] = useState('');
    const [LastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [showVerifycationModal, setShowVerifycationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const router = useIonRouter();
    

    {/*function for account verification*/}
    const handleVerification = () => {
        if (!FirstName || !LastName || !username || !email || !password || !confirmPassword) {
            setErrorMessage('Please fill in all fields');
            setShowAlert(true);
            return;
        }

        // Add privacy agreement validation
        if (!agreedToPrivacy) {
            setErrorMessage('Please agree to the Data Privacy Act to continue');
            setShowAlert(true);
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            setShowAlert(true);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            setShowAlert(true);
            return;
        }

        setShowVerifycationModal(true);
    };
    {/*function to handle account creation*/}
    const handleSignup = async () => {
        setShowVerifycationModal(false);
        try {
        
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    username,
                    userfirstName: FirstName,
                    userlastName: LastName
                }
            }
        });

        if (authError) {
            throw new Error("Account creation failed: " + authError.message);
        }

        if (authData.user) {
            //hash password before storing
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            
            const { error: insertError } = await supabase.from("users")
                .insert([
                    {
                        auth_id: authData.user.id,
                        username: username,
                        email: email,
                        userfirstName: FirstName,
                        userlastName: LastName,
                        password: hashedPassword,
                        role: 'teenager',
                        privacy_agreement: agreedToPrivacy, 
                        privacy_agreed_at: new Date().toISOString() 
                    }
                ]);

            if (insertError) {
                throw new Error("Failed to save user data: " + insertError.message);
            }

            // Show success modal and redirect
            setShowSuccessModal(true);
            setTimeout(() => {
                router.push('/', 'forward', 'replace');
            }, 2000);
        }
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage('Account creation failed');
            }
            setShowAlert(true);
        }
    };

    
    
    return (
        <IonPage>
            <IonContent 
                className="ion-padding"
                style={{
                    '--background': '#ffffff',
                }}
            >
                <IonGrid style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <IonRow className="ion-justify-content-center ion-align-items-center" style={{ minHeight: '100vh' }}>
                        <IonCol size="12" sizeMd="10" sizeLg="8">
                            <IonCard
                                style={{
                                    borderRadius: '24px',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                                    overflow: 'hidden',
                                    background: '#ffffff',
                                }}
                            >
                                <IonCardContent style={{ padding: 'clamp(20px, 5vw, 48px)' }}>
                                    {/* Header */}
                                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                        <h1
                                            style={{
                                                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                                                fontWeight: '700',
                                                background: 'linear-gradient(135deg, #002d54 0%, #004080 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            Create Account
                                        </h1>
                                        <p style={{ color: '#666', fontSize: '1rem' }}>
                                            Join us to get started
                                        </p>
                                    </div>

                                    <IonGrid style={{ padding: 0 }}>
                                        {/* Name Fields */}
                                        <IonRow>
                                            <IonCol size="12" sizeMd="6">
                                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                                    <IonInput
                                                        fill="outline" 
                                                        label="First Name" 
                                                        labelPlacement="floating" 
                                                        placeholder="Enter your first name"
                                                        required
                                                        value={FirstName}
                                                        onIonInput={(e) => setFirstName(e.detail.value!)}
                                                        style={{
                                                            '--border-radius': '12px',
                                                            '--border-width': '2px',
                                                            '--highlight-color-focused': '#002d54',
                                                        }}
                                                    >
                                                        <IonIcon icon={personOutline} slot="start" style={{ marginRight: '8px', color: '#002d54' }} />
                                                    </IonInput>
                                                </div>
                                            </IonCol>
                                            <IonCol size="12" sizeMd="6">
                                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                                    <IonInput
                                                        fill="outline" 
                                                        label="Last Name" 
                                                        labelPlacement="floating" 
                                                        placeholder="Enter your last name"
                                                        required
                                                        value={LastName}
                                                        onIonInput={(e) => setLastName(e.detail.value!)}
                                                        style={{
                                                            '--border-radius': '12px',
                                                            '--border-width': '2px',
                                                            '--highlight-color-focused': '#002d54',
                                                        }}
                                                    >
                                                        <IonIcon icon={personOutline} slot="start" style={{ marginRight: '8px', color: '#002d54' }} />
                                                    </IonInput>
                                                </div>
                                            </IonCol>
                                        </IonRow>
                                   
                                        {/* Username */}
                                        <IonRow>
                                            <IonCol size="12">
                                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                                    <IonInput
                                                        fill="outline" 
                                                        label="Username" 
                                                        labelPlacement="floating" 
                                                        placeholder="Choose a username"
                                                        required
                                                        value={username}
                                                        onIonInput={(e) => setUsername(e.detail.value!)}
                                                        style={{
                                                            '--border-radius': '12px',
                                                            '--border-width': '2px',
                                                            '--highlight-color-focused': '#002d54',
                                                        }}
                                                    >
                                                        <IonIcon icon={personOutline} slot="start" style={{ marginRight: '8px', color: '#002d54' }} />
                                                    </IonInput>
                                                </div>
                                            </IonCol>
                                        </IonRow>
                                        
                                        {/* Email */}
                                        <IonRow>
                                            <IonCol size="12">
                                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                                    <IonInput
                                                        fill="outline" 
                                                        label="Email" 
                                                        labelPlacement="floating" 
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        required
                                                        value={email}
                                                        onIonInput={(e) => setEmail(e.detail.value!)}
                                                        style={{
                                                            '--border-radius': '12px',
                                                            '--border-width': '2px',
                                                            '--highlight-color-focused': '#002d54',
                                                        }}
                                                    >
                                                        <IonIcon icon={mailOutline} slot="start" style={{ marginRight: '8px', color: '#002d54' }} />
                                                    </IonInput>
                                                </div>
                                            </IonCol>
                                        </IonRow>

                                        {/* Password Fields */}
                                        <IonRow>
                                            <IonCol size="12" sizeMd="6">
                                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                                    <IonInput
                                                        fill="outline" 
                                                        label="Password" 
                                                        type='password'
                                                        labelPlacement="floating" 
                                                        placeholder="Enter your password"
                                                        required
                                                        value={password}
                                                        onIonInput={(e) => setPassword(e.detail.value!)}
                                                        style={{
                                                            '--border-radius': '12px',
                                                            '--border-width': '2px',
                                                            '--highlight-color-focused': '#002d54',
                                                        }}
                                                    >
                                                        <IonIcon icon={lockClosedOutline} slot="start" style={{ marginRight: '8px', color: '#002d54' }} />
                                                        <IonInputPasswordToggle slot="end" />
                                                    </IonInput>
                                                </div>
                                            </IonCol>

                                            <IonCol size="12" sizeMd="6">
                                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                                    <IonInput
                                                        fill="outline" 
                                                        label="Confirm Password" 
                                                        type='password'
                                                        labelPlacement="floating" 
                                                        placeholder="Confirm your password"
                                                        required
                                                        value={confirmPassword}
                                                        onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                                                        style={{
                                                            '--border-radius': '12px',
                                                            '--border-width': '2px',
                                                            '--highlight-color-focused': '#002d54',
                                                        }}
                                                    >
                                                        <IonIcon icon={lockClosedOutline} slot="start" style={{ marginRight: '8px', color: '#002d54' }} />
                                                        <IonInputPasswordToggle slot="end" />
                                                    </IonInput>
                                                </div>
                                            </IonCol>
                                        </IonRow>

                                        {/* Data Privacy Agreement */}
                                        <IonRow>
                                            <IonCol>
                                                <div style={{ marginBottom: '20px', padding: '16px', border: '2px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                                                    <IonItem 
                                                        lines="none" 
                                                        style={{ 
                                                            '--background': 'transparent',
                                                            '--padding-start': '0px',
                                                            '--inner-padding-end': '0px'
                                                        }}
                                                    >
                                                        <IonCheckbox 
                                                            checked={agreedToPrivacy}
                                                            onIonChange={(e) => setAgreedToPrivacy(e.detail.checked)}
                                                            slot="start"
                                                            style={{ 
                                                                '--checkmark-color': 'white',
                                                                '--background-checked': '#002d54',
                                                                '--border-color-checked': '#002d54',
                                                                marginRight: '12px'
                                                            }}
                                                        />
                                                        <IonLabel style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                                            <IonText style={{ color: '#333' }}>
                                                                <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#002d54', marginRight: '4px' }} />
                                                                I agree to the <strong style={{ color: '#002d54' }}>Data Privacy Act (RA 10173)</strong> and 
                                                                understand that my personal information will be collected and processed solely for 
                                                                <strong> analysis purposes</strong> to improve maternal and child health services. 
                                                                I consent to the secure storage and authorized use of my data.
                                                            </IonText>
                                                        </IonLabel>
                                                    </IonItem>
                                                </div>
                                            </IonCol>
                                        </IonRow>

                                        {/* Register Button */}
                                        <IonRow>
                                            <IonCol>
                                                <IonButton
                                                    expand="block"
                                                    onClick={handleVerification}
                                                    style={{
                                                        '--background': '#002d54',
                                                        '--background-hover': '#003d6b',
                                                        '--border-radius': '12px',
                                                        '--box-shadow': '0 8px 16px rgba(0, 45, 84, 0.4)',
                                                        height: '52px',
                                                        fontSize: '1.1rem',
                                                        fontWeight: '600',
                                                        marginTop: '8px',
                                                        color: 'white',
                                                    }}
                                                >
                                                    Create Account
                                                </IonButton>
                                            </IonCol>
                                        </IonRow>

                                        {/* Login Link */}
                                        <IonRow>
                                            <IonCol>
                                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                                    <IonText style={{ color: '#666' }}>
                                                        Already have an account?{' '}
                                                        <a 
                                                            href="/" 
                                                            style={{ 
                                                                color: '#002d54', 
                                                                fontWeight: '600',
                                                                textDecoration: 'none'
                                                            }}
                                                        >
                                                            Sign In
                                                        </a>
                                                    </IonText>
                                                </div>
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Verification Modal */}
                <IonModal 
                    isOpen={showVerifycationModal} 
                    onDidDismiss={() => setShowVerifycationModal(false)}
                    style={{ '--border-radius': '16px' }}
                >
                    <IonContent style={{ '--background': '#f5f5f5' }}>
                        <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
                            <IonCard style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <IonCardHeader>
                                    <IonCardTitle style={{ color: '#000', fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
                                        Confirm Details
                                    </IonCardTitle>
                                    <hr style={{ border: 'none', borderTop: '2px solid #002d54', margin: '16px 0' }} />
                                </IonCardHeader>
                                <IonCardContent>
                                    <div style={{ marginBottom: '20px' }}>
                                        <IonCardSubtitle style={{ color: '#666', fontSize: '0.875rem', marginBottom: '4px' }}>
                                            Username
                                        </IonCardSubtitle>
                                        <IonCardTitle style={{ color: '#000', fontSize: '1.125rem' }}>
                                            {username}
                                        </IonCardTitle>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <IonCardSubtitle style={{ color: '#666', fontSize: '0.875rem', marginBottom: '4px' }}>
                                            Email
                                        </IonCardSubtitle>
                                        <IonCardTitle style={{ color: '#000', fontSize: '1.125rem' }}>
                                            {email}
                                        </IonCardTitle>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <IonCardSubtitle style={{ color: '#666', fontSize: '0.875rem', marginBottom: '4px' }}>
                                            Full Name
                                        </IonCardSubtitle>
                                        <IonCardTitle style={{ color: '#000', fontSize: '1.125rem' }}>
                                            {FirstName} {LastName}
                                        </IonCardTitle>
                                    </div>

                                    <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                                        <IonCardSubtitle style={{ color: '#666', fontSize: '0.875rem', marginBottom: '4px' }}>
                                            Data Privacy Agreement
                                        </IonCardSubtitle>
                                        <IonText style={{ color: '#28a745', fontSize: '0.9rem' }}>
                                            <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '4px' }} />
                                            Agreed to Data Privacy Act (RA 10173)
                                        </IonText>
                                    </div>

                                    <IonRow>
                                        <IonCol>
                                            <IonButton
                                                expand="block"
                                                onClick={handleSignup}
                                                style={{
                                                    '--background': '#002d54',
                                                    '--border-radius': '12px',
                                                    height: '48px',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                Confirm
                                            </IonButton>
                                        </IonCol>
                                        <IonCol>
                                            <IonButton
                                                expand="block"
                                                onClick={() => setShowVerifycationModal(false)}
                                                fill="outline"
                                                style={{
                                                    '--border-color': '#e93740',
                                                    '--color': '#e93740',
                                                    '--border-radius': '12px',
                                                    height: '48px',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                Cancel
                                            </IonButton>
                                        </IonCol>
                                    </IonRow>
                                </IonCardContent>
                            </IonCard>
                        </div>
                    </IonContent>
                </IonModal>

                {/* Success Modal */}
                <IonModal 
                    isOpen={showSuccessModal} 
                    onDidDismiss={() => setShowSuccessModal(false)}
                    style={{ '--border-radius': '16px' }}
                >
                    <IonContent style={{ '--background': '#f5f5f5' }}>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            height: '100%',
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <IonIcon 
                                icon={checkmarkCircleOutline} 
                                style={{ 
                                    fontSize: '120px', 
                                    color: '#28a745',
                                    marginBottom: '24px',
                                    animation: 'scaleIn 0.5s ease-out'
                                }} 
                            />
                            <h2 style={{ 
                                fontSize: '2rem', 
                                fontWeight: '700',
                                color: '#000',
                                marginBottom: '16px'
                            }}>
                                Account Created!
                            </h2>
                            <IonText style={{ 
                                fontSize: '1.125rem',
                                color: '#666',
                                marginBottom: '32px'
                            }}>
                                Your account has been created successfully.
                                <br />
                                Redirecting to login page...
                            </IonText>
                            <IonButton 
                                routerLink='/' 
                                routerDirection='back'
                                style={{
                                    '--background': '#002d54',
                                    '--border-radius': '12px',
                                    '--box-shadow': '0 8px 16px rgba(0, 45, 84, 0.4)',
                                    minWidth: '200px',
                                    height: '48px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                }}
                            >
                                Go to Login
                            </IonButton>
                        </div>
                    </IonContent>
                </IonModal>
                
                <AlertBox message={errorMessage} isOpen={showAlert} onClose={() => setShowAlert(false)} />
            </IonContent>

            <style>{`
                @keyframes scaleIn {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </IonPage>
    );
};

export default Register;
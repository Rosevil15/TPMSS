import { IonAlert, IonButton, IonCard, IonCardContent, IonCheckbox, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonInputPasswordToggle, IonItem, IonLabel, IonPage, IonRow, IonText, IonTitle, IonToast, IonToolbar, useIonLoading, useIonRouter } from '@ionic/react';
import React, { useState } from 'react';
import { logIn, logoGoogle, mailOutline, lockClosedOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { supabase } from '../utils/supabaseClients';
import PrivacyAgreementModal from '../components/PrivacyAgreementModal';

const Alertbox: React.FC<{
    message: string;
    isOpen: boolean;
    onClose: () => void
}> = ({ message, isOpen, onClose }) => {
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

const Login: React.FC = () => {
    const router = useIonRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')

    const [present, dismiss] = useIonLoading();
    const [showAlert, setShowAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToPrivacySocial, setAgreedToPrivacySocial] = useState(true); 
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [pendingUser, setPendingUser] = useState<any>(null);

    const handlePrivacyAcceptance = async () => {
        if (!pendingUser) return;

        try {
            // Update user's privacy agreement in database
            const { error } = await supabase
                .from('users')
                .update({
                    privacy_agreement: true,
                    privacy_agreed_at: new Date().toISOString()
                })
                .eq('auth_id', pendingUser.id);

            if (error) {
                console.error('Error updating privacy agreement:', error);
                setErrorMessage('Error updating privacy agreement');
                setShowAlert(true);
                return;
            }

            setShowPrivacyModal(false);
            setPendingUser(null);

            // Continue with login flow
            const userData = await supabase
                .from('users')
                .select('active, role')
                .eq('auth_id', pendingUser.id)
                .single();

            if (userData.data) {
                const userRole = userData.data.role;
                const adminRoles = ['admin', 'healthworker', 'socialworker', 'school'];

                setShowToast(true);
                setTimeout(() => {
                    if (adminRoles.includes(userRole)) {
                        router.push('/admin', 'forward', 'replace');
                    } else {
                        router.push('/home', 'forward', 'replace');
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Privacy agreement error:', error);
            setErrorMessage('Error processing privacy agreement');
            setShowAlert(true);
        }
    };

    //Function to handle email and password login
    const doLogin = async () => {   
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const trimmedEmail = (email || '').trim();
        const trimmedPassword = (password || '').trim();

        if (!trimmedEmail || !trimmedPassword) {
        setErrorMessage("Please enter both email and password");
        setShowAlert(true);
        return;
        }
        
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
           await present('Signing in...');
           setErrorMessage('');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password: trimmedPassword,
            });

            if (error) {
                console.error('Authentication error:', error);
                setErrorMessage("Login failed: " + error.message);
                setShowAlert(true);
                return;
            }

           
            if (data.user) {
                
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('active, role, privacy_agreement')
                    .eq('auth_id', data.user.id)
                    .single();

                 

                if (userError) {
                    console.error('Error fetching user data:', userError);
                    
                    
                    if (userError.code === 'PGRST116') {
                        
                        
                        setShowToast(true);
                        setTimeout(() => {
                            router.push('/home', 'forward', 'replace');
                        }, 1000);
                        return;
                        
                    } else {
                        setErrorMessage("Error verifying account status");
                        setShowAlert(true); 
                        await supabase.auth.signOut();
                        return;
                    }
                } else {
                    
                    const isActive = userData?.active !== false;

                    if (!isActive) {
                        setErrorMessage("Your account has been deactivated. Please contact an administrator.");
                        setShowAlert(true);      
                        await supabase.auth.signOut();
                        return;
                    }

                    if (!userData?.privacy_agreement) {
                        console.log('User has not agreed to privacy policy, showing modal');
                        setPendingUser(data.user);
                        setShowPrivacyModal(true);
                        return; // Don't continue login flow
                    }

                    const userRole = userData.role;
                    const adminRoles = ['admin', 'healthworker', 'socialworker', 'school'];

                    setShowToast(true);
                    setTimeout(() => {
                        if ( adminRoles.includes(userRole) ) {
                            router.push('/admin', 'forward', 'replace');
                        } else {
                            router.push('/home', 'forward', 'replace');
                        }
                    }, 1000);
                    return;
                }
            }

        } catch (error: any) {
            console.error('Login error:', error);
            setErrorMessage("An unexpected error occurred");
            setShowAlert(true);
        } finally {
            setIsLoading(false);
            await dismiss();
        }
    };


    const socialLogin = async (provider: 'google' | 'facebook') => {

        if (!agreedToPrivacySocial) {
            setErrorMessage("Please agree to the Data Privacy Act to continue with social login");
            setShowAlert(true);
            return;
        }

        await present('Signing in...');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setErrorMessage(error.message || 'Login failed');
            setShowAlert(true);
        } finally {
            dismiss();
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
                <IonGrid style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <IonRow className="ion-justify-content-center ion-align-items-center" style={{ minHeight: '100vh' }}>
                        <IonCol size="12">
                            <IonCard
                                style={{
                                    borderRadius: '24px',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                                    overflow: 'hidden',
                                    background: '#ffffff',
                                }}
                            >
                                <IonCardContent style={{ padding: 'clamp(24px, 5vw, 48px)' }}>
                                    {/* Logo */}
                                    <div className="ion-text-center" style={{ marginBottom: '24px' }}>
                                        <img
                                            src="../assets/logo2.JPG"
                                            alt="L.E.A.P Logo"
                                            style={{
                                                width: 'clamp(100px, 30vw, 180px)',
                                                height: 'clamp(100px, 30vw, 150px)',
                                                objectFit: 'contain',
                                                margin: '0 auto',
                                                display: 'block',
                                            }}
                                        />
                                    </div>

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
                                            Welcome Back
                                        </h1>
                                        <p style={{ color: '#666', fontSize: '1rem' }}>
                                            Sign in to continue
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            doLogin();
                                        }}
                                    >
                                        {/* Email Input */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <IonInput
                                                value={email}
                                                onIonChange={(e) => {
                                                    const value = e.detail.value || '';
                                                    setEmail(value);
                                                }}
                                                onIonInput={(e) => {
                                                    const value = String((e.target as HTMLIonInputElement).value || '');
                                                    setEmail(value);
                                                }}
                                                fill="outline"
                                                type="email"
                                                label="Email"
                                                labelPlacement="floating"
                                                placeholder="Enter your email"
                                                required
                                                style={{
                                                    '--border-radius': '12px',
                                                    '--border-width': '2px',
                                                    '--highlight-color-focused': '#002d54',
                                                }}
                                            >
                                                <IonIcon icon={mailOutline} slot="start" style={{ marginRight: '8px', color: '#002d54' }} />
                                            </IonInput>
                                        </div>

                                        {/* Password Input */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <IonInput
                                                value={password}
                                                onIonChange={(e) => {
                                                    const value = e.detail.value || '';
                                                   
                                                    setPassword(value);
                                                }}
                                                onIonInput={(e) => {
                                                    const value = String((e.target as HTMLIonInputElement).value || '');
                                                    setPassword(value);
                                                }}
                                                fill="outline"
                                                type="password"
                                                label="Password"
                                                labelPlacement="floating"
                                                placeholder="Enter your password"
                                                required
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

                                        {/* Login Button */}
                                        <IonButton
                                            type='submit'
                                            expand="block"
                                            disabled={isLoading}
                                            style={{
                                                '--background': '#002d54',
                                                '--background-hover': '#003d6b',
                                                '--border-radius': '12px',
                                                '--box-shadow': '0 8px 16px rgba(0, 45, 84, 0.4)',
                                                height: '52px',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                marginBottom: '16px',
                                                color: 'white',
                                            }}
                                        >
                                            Sign In
                                            <IonIcon icon={logIn} slot="end" />
                                        </IonButton>
                                    </form>

                                    {/* Divider */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        margin: '24px 0',
                                    }}>
                                        <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
                                        <span style={{ padding: '0 16px', color: '#666', fontSize: '0.9rem' }}>
                                            or continue with
                                        </span>
                                        <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
                                    </div>

                                    <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                                        <IonItem 
                                            lines="none" 
                                            style={{ 
                                                '--background': 'transparent',
                                                '--padding-start': '0px',
                                                '--inner-padding-end': '0px'
                                            }}
                                        >
                                            <IonCheckbox 
                                                checked={agreedToPrivacySocial}
                                                onIonChange={(e) => setAgreedToPrivacySocial(e.detail.checked)}
                                                slot="start"
                                                style={{ 
                                                    '--checkmark-color': 'white',
                                                    '--background-checked': '#002d54',
                                                    '--border-color-checked': '#002d54',
                                                    marginRight: '8px'
                                                }}
                                            />
                                            <IonLabel style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                                                <IonText style={{ color: '#333' }}>
                                                    <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#002d54', marginRight: '4px', fontSize: '14px' }} />
                                                    I agree to the <strong style={{ color: '#002d54' }}>Data Privacy Act</strong>
                                                </IonText>
                                            </IonLabel>
                                        </IonItem>
                                    </div>

                                    {/* Social Login Buttons */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <IonButton
                                            expand="block"
                                            fill="outline"
                                            onClick={() => socialLogin('google')}
                                            style={{
                                                '--border-radius': '12px',
                                                '--border-width': '2px',
                                                '--border-color': '#DB4437',
                                                '--color': '#DB4437',
                                                height: '48px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                            }}
                                        >
                                            <IonIcon icon={logoGoogle} slot="start" style={{ fontSize: '24px' }} />
                                            Sign in with Google
                                        </IonButton>
                                    </div>

                                    {/* Register Link */}
                                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                        <IonText style={{ color: '#666' }}>
                                            Don't have an account?{' '}
                                            <a
                                                href="/Register"
                                                style={{
                                                    color: '#002d54',
                                                    fontWeight: '600',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                Sign Up
                                            </a>
                                        </IonText>
                                    </div>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <Alertbox
                    isOpen={showAlert}
                    message={errorMessage}
                    onClose={() => setShowAlert(false)}
                />

                <IonToast
                    isOpen={showToast}
                    message="Login Successfully!"
                    onDidDismiss={() => setShowToast(false)}
                    duration={3000}
                    color='success'
                    position="top"
                />

                <PrivacyAgreementModal 
                    isOpen={showPrivacyModal}
                    onAccept={handlePrivacyAcceptance}
                    canClose={false} 
                />


            </IonContent>
        </IonPage>
    );
};

export default Login;
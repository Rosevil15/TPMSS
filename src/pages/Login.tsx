import { IonAlert, IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonInputPasswordToggle, IonPage, IonRow, IonText, IonTitle, IonToast, IonToolbar, useIonLoading, useIonRouter } from '@ionic/react';
import React from 'react';
import { logIn, logoGoogle, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { supabase } from '../utils/supabaseClients';

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
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('')

    const [present, dismiss] = useIonLoading();
    const [showAlert, setShowAlert] = React.useState(false);
    const [showToast, setShowToast] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    //Function to handle email and password login
    const doLogin = async () => {
       
        if (isLoading) return;
        
        setIsLoading(true);
        await present('Signing in...');
        
        try {
           
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setErrorMessage("Login failed: " + error.message);
                setShowAlert(true);
                return;
            }

           
            if (data.user) {
               
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('active, role')
                    .eq('auth_id', data.user.id)
                    .single();

                console.log('User active status:', userData); // Debug log

                if (userError) {
                    console.error('Error fetching user data:', userError);
                    
                    
                    if (userError.code === 'PGRST116') {
                        console.log('User not found in users table, treating as active');
                        
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
                }
            }

           
            setShowToast(true);
            setTimeout(() => {
                router.push('/home', 'forward', 'replace');
            }, 1000);
        } catch (error: any) {
            console.error('Login error:', error);
            setErrorMessage("An unexpected error occurred");
            setShowAlert(true);
        } finally {
            setIsLoading(false);
            dismiss();
        }
    };


    const socialLogin = async (provider: 'google' | 'facebook') => {
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
                                                onIonChange={(e) => setEmail(e.detail.value!)}
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
                                                onIonChange={(e) => setPassword(e.detail.value!)}
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

            </IonContent>
        </IonPage>
    );
};

export default Login;
import { supabase } from '../utils/supabaseClients';

interface ProfileData {
  // Basic info
  profileid: number;
  firstName: string;  
  lastName: string;   
  birthdate: string | null;
  age: number;
  contactnum: string;
  marital_status: string;
  living_with: string;
  current_year_level: string;
  highest_educational_attainment: string;
  religion: string;
  fathers_occupation: string;
  mothers_occupation: string;
  teenage_income: string;
  teenage_occupation: string;
  fathers_income: string;
  mothers_income: string;
  type_of_school: string;
  indigenous_ethnicity: string;
  multiple_partner_num: string;

  // Address info
  barangay: string;
  municipality: string;
  province: string;
  zipcode: string;
}

interface PartnersData {
  partnerid: number;
  profileid: number;
  pFirstname: string;
  pLastname: string;
  pAge: number;
  pBirthdate: string | null;
  pOccupation: string;
  pIncome: string;
  contact_num: string;
  region: string;
  province: string;
  municipality: string;
  barangay: string;
  zipcode: string;
  marital_status: string;
  living_with: string;
  current_year_level: string;
  highest_educational_attainment: string;
  religion: string;
  fathers_occupation: string;
  mothers_occupation: string;
  fathers_income: string;
  mothers_income: string;
  type_of_school: string;
  indigenous_ethnicity: string;
}



export async function saveCompleteProfile(
  profileData: ProfileData,

  partnersPayload: PartnersData
) {
  try {
    
    //Insert into profile table
    const { data: profileResult, error: profileError } = await supabase
      .from('profile')
      .insert([profileData])
      .select('profileid');

    if (profileError) throw profileError;

    const profileid = profileResult[0].profileid;

    //Insert into partners table
    const {data: partnersResult, error: partnersError} = await supabase
      .from('partnersInfo')
      .insert([{...partnersPayload, profileid}]);

      if (partnersError) {
        // Rollback previous insertions
        await supabase
          .from('maternalhealthRecord')
          .delete()
          .match({ health_id: profileData.profileid });
          throw partnersError;
      }
    return { success: true, message: "Profile information successfully saved" };
  } catch (error: any) {
    console.error("Error saving profile:", error);
    return { 
      success: false, 
      message: "Failed to save profile information", 
      error: error.message 
    };
  }
}


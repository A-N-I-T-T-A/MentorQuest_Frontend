const API_URL = 'https://mentorquest-backend.onrender.com/mentorapp';

export const getMentors = async (searchQuery = '', selectedSkills = [], priceRange = [0, 3000]) => {
  try {
    const response = await fetch(`${API_URL}/mentors/`);

    if (!response.ok) {
      throw new Error('Failed to fetch mentors');
    }

    let mentors = await response.json();
    console.log('Raw mentors data:', mentors); // Debug log

    // Client-side filtering based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      mentors = mentors.filter(mentor => 
        mentor.user?.username?.toLowerCase().includes(query) ||
        mentor.designation?.toLowerCase().includes(query) ||
        mentor.company?.toLowerCase().includes(query) ||
        mentor.skills?.some(skill => skill.skill_name.toLowerCase().includes(query))
      );
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      mentors = mentors.filter(mentor =>
        mentor.skills?.some(skill => selectedSkills.includes(skill.skill_name))
      );
    }

    // Filter by price range, if max is 3000, include all prices above it
    mentors = mentors.filter(mentor => {
      const price = parseFloat(mentor.hourly_rate || 0);
      return price >= priceRange[0] && 
             (priceRange[1] === 3000 ? price >= 0 : price <= priceRange[1]);
    });

    console.log('Filtered mentors:', mentors); // Debug log
    return mentors;
  } catch (error) {
    console.error('Error fetching mentors:', error);
    throw error;
  }
};

export const getMentorById = async (mentorId) => {
  try {
    console.log('Fetching mentor with ID:', mentorId);
    const response = await fetch(`${API_URL}/mentors/${mentorId}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentor details');
    }

    const data = await response.json();
    console.log('Raw mentor data from API:', data);
    
    // Log specific fields we're interested in
    console.log('Skills:', data.skills);
    console.log('Availability:', data.availability);
    
    return data;
  } catch (error) {
    console.error('Error fetching mentor details:', error);
    throw error;
  }
};

export const getAvailableSkills = async () => {
  try {
    const response = await fetch(`${API_URL}/skills/`);

    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
};

export const getMentorsBySkills = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/mentors/matching/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch matching mentors');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching matching mentors:', error);
    throw error;
  }
};

export const getMentorMentees = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/mentorship-relationships/active/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch mentees');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getMentorMentees:', error);
        throw error;
    }
};

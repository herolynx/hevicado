let user = {
  getContactInfo: function(user) {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      degree: user.degree,
      email: user.email,
      phone: user.phone,
      role: user.role
    };
  }
};

export default user;

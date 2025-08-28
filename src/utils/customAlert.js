import Swal from 'sweetalert2'

// Theme-based confirm button style
const confirmBtnClass = 'bg-[#3E57A7]  cursor-pointer text-white px-5 py-2 rounded mr-3 hover:bg-blue-800';
const cancelBtnClass = 'bg-gray-200 cursor-pointer text-gray-800 px-5 py-2 rounded hover:bg-gray-300'

export const showSuccess = (title = 'Success', text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: confirmBtnClass,
    },
    buttonsStyling: false,
  })
}

export const showError = (title = 'Error', text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: confirmBtnClass,
    },
    buttonsStyling: false,
  })
}

export const showConfirm = ({
  title = 'Are you sure?',
  text = '',
  confirmButtonText = 'Yes',
  cancelButtonText = 'Cancel',
  icon = 'warning',
} = {}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      confirmButton: confirmBtnClass,
      cancelButton: cancelBtnClass,
    },
    buttonsStyling: false, 
  });
};

export const showToast = (message = '', type = 'success') => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  })
}

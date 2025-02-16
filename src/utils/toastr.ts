import toastr from 'toastr';

const defaultOpts: ToastrOptions = {
    closeButton: true,
    debug: false,
    positionClass: 'toast-top-right',
    onclick: null,
    showDuration: 300,
    hideDuration: 1000,
    timeOut: 5000,
    extendedTimeOut: 1000,
    showEasing: 'swing',
    hideEasing: 'linear',
    hideMethod: 'fadeOut',
    preventDuplicates: true,
    progressBar: true,
    newestOnTop: true,
};

const getOptions = (opts?: ToastrOptions) => {
    return {
        ...defaultOpts,
        ...opts
    };
}

export interface ToastrOpts {
    title?: string;
    additionalOpts?: ToastrOptions;
}

export default {
    success: (message: string, opts?: ToastrOpts) => {
        toastr.options = getOptions(opts?.additionalOpts);
        toastr.success(message, opts.title);
    },
    error: (message: string, opts?: ToastrOpts) => {
        toastr.options = getOptions(opts?.additionalOpts);
        toastr.error(message, opts?.title);
    },
    info: (message: string, opts?: ToastrOpts) => {
        toastr.options = getOptions(opts?.additionalOpts);
        toastr.info(message, opts?.title);
    },
    warning: (message: string, opts?: ToastrOpts) => {
        toastr.options = getOptions(opts?.additionalOpts);
        toastr.warning(message, opts?.title);
    },
    clear: () => {
        toastr.clear();
    }
}
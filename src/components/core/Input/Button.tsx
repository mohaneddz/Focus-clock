interface Props {
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'basic' | '';
    class?: string;
    disabled?: boolean;
    children?: any;
}

export default function Button(props: Props) {

    const getVariantClass = () => {
        switch (props.variant) {
            case 'primary':
                return 'bg-accent text-text';
            case 'secondary':
                return 'bg-gray-500 text-text hover:bg-gray-600';
            case 'danger':
                return 'bg-red-500 text-text hover:bg-red-600';
            case 'basic':
                return 'bg-gray-500 text-text hover:bg-gray-400';
            case 'ghost':
                return 'bg-transparent text-gray-300 hover:bg-gray-700 hover:text-text border border-gray-300';
            default:
                return ' ';
        }
    }

    return (
        <div class={`hover:brightness-105 active:brightness-95 hover:scale-102 active:scale-95 transition-all duration-100 py-4 px-2 rounded-sm ${getVariantClass()} ${props.class} ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onclick={!props.disabled ? props.onClick : undefined}>
            {props.children}
        </div>
    );
};

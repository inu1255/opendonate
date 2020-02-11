import IImagePreview from './IImagePreview';
import IPopup from './IPopup';
import IImageCrop from './IImageCrop';
import IModal from './IModal';
import ICircle from './ICircle';
import IIcon from './IIcon';
import IButton from './IButton';
import ITabs from './ITabs';
import IDrawer from './IDrawer';
import IGroup from './IGroup';
import ISlider from './ISlider';
import IImg from './IImg';
import IRate from './IRate';
import IDate from './IDate';
import IInput from './IInput';
import ITable from './ITable';
import IRadio from './IRadio';
import ISpan from './ISpan';
import IList from './IList';
import IListItem from './IListItem';
import IRender from './IEditor/render';
import IPage from './IPage';
import IForm from './IForm';
import IDrop from './IDrop';

const components = {
	IImagePreview,
	IPopup,
	IImageCrop,
	IModal,
	ICircle,
	IIcon,
	IButton,
	ITabs,
	IDrawer,
	IGroup,
	ISlider,
	IImg,
	IRate,
	IDate,
	IInput,
	ITable,
	IRadio,
	ISpan,
	IList,
	IListItem,
	IRender,
	IPage,
	IForm,
	IDrop,
};
const install = function(Vue, opts = {}) {
	for (let k in components) {
		let v = components[k];
		Vue.component(k, v);
	}
};

//  可以根据实际情况，是否需要这段代码（CDN引入，便可使用所有组件）
if (window && window.Vue) install(window.Vue);
//  3、导出类库的版本、组件、Vue插件需要暴露的install方法
export default {
	version: '0.0.1',
	install,
};
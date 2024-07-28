/**
 * Sets `BufferAttribute.updateRange` since r159.
 */
const setUpdateRange = (attribute, updateRange) => {
    if ('updateRanges' in attribute) {
      // r159
      // @ts-ignore
      attribute.updateRanges[0] = updateRange;
    } else {
      // @ts-ignore
      attribute.updateRange = updateRange;
    }
  };
  
  export { setUpdateRange };
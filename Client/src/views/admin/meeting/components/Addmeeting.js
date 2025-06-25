import { Button, Flex, FormLabel, Grid, GridItem, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Text, Textarea } from '@chakra-ui/react';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';
import MultiContactModel from 'components/commonTableModel/MultiContactModel';
import MultiLeadModel from 'components/commonTableModel/MultiLeadModel';
import Spinner from 'components/spinner/Spinner';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { LiaMousePointerSolid } from 'react-icons/lia';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MeetingSchema } from 'schema';
import { getApi, postApi, putApi } from 'services/api';

const AddMeeting = (props) => {
    const { onClose, isOpen, setAction, from, fetchData, view, editMode, editId } = props
    const [leadData, setLeadData] = useState([])
    const [contactdata, setContactData] = useState([])
    const [isLoding, setIsLoding] = useState(false)
    const [contactModelOpen, setContactModel] = useState(false);
    const [leadModelOpen, setLeadModel] = useState(false);
    const todayTime = new Date().toISOString().split('.')[0];

    const user = JSON.parse(localStorage.getItem('user'))

    const initialValues = {
        agenda: '',
        attendes: props.leadContect === 'contactView' && props.id ? [props.id] : [],
        attendesLead: props.leadContect === 'leadView' && props.id ? [props.id] : [],
        location: '',
        related: props.leadContect === 'contactView' ? 'Contact' : props.leadContect === 'leadView' ? 'Lead' : 'None',
        dateTime: '',
        notes: '',
        createBy: user?._id,
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: MeetingSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            if (editMode) {
                EditData();
            } else {
                AddData();
            }
            resetForm();
          },
    });
    const { errors, touched, values, handleBlur, handleChange, handleSubmit, setFieldValue } = formik

    const AddData = async () => {
        try {
            setIsLoding(true)
            let response = await postApi('api/meeting/add', { ...values, moduleId: props?.contactData?._id })
            if (response.status === 200) {
                props.onClose();
                props.setAction((pre) => !pre)
                toast.success('Meeting added successfully');
            }
        } catch (e) {
            console.log(e);
            toast.error('Failed to add meeting');
        }
        finally {
            setIsLoding(false)
        }

    };  

    const EditData = async () => {
        try {
            setIsLoding(true)
            let response = await putApi(`api/meeting/edit/${editId}`, values)
            if (response.status === 200) {
                props.onClose();
                props.setAction((pre) => !pre)
                toast.success('Meeting updated successfully');
            }
        } catch (e) {
            console.log(e);
            toast.error('Failed to update meeting');
        }
        finally {
            setIsLoding(false)
        }
    };
    
    const handleCancel = () => {
        formik.resetForm();
        props.onClose()
    }

    const fetchAllData = async () => {
        try {
            if (values.related === "Contact") {
                const result = await getApi(user.role === 'superAdmin' ? 'api/contact/' : `api/contact/?createBy=${user._id}`)
                setContactData(result?.data || [])
            } else if (values.related === "Lead") {
                const result = await getApi(user.role === 'superAdmin' ? 'api/lead/' : `api/lead/?createBy=${user._id}`)
                setLeadData(result?.data || [])
            }
        } catch (e) {
            console.log(e);
        }
    }

    const fetchMeetingData = async () => {
        if (editMode && editId) {
            try {
                setIsLoding(true)
                const response = await getApi('api/meeting/view/', editId)
                if (response.status === 200) {
                    const meetingData = response.data.data;
                    setFieldValue('agenda', meetingData.agenda || '');
                    setFieldValue('attendes', meetingData.attendes?.map(contact => contact._id) || []);
                    setFieldValue('attendesLead', meetingData.attendesLead?.map(lead => lead._id) || []);
                    setFieldValue('location', meetingData.location || '');
                    setFieldValue('related', meetingData.related || 'None');
                    setFieldValue('dateTime', meetingData.dateTime ? dayjs(meetingData.dateTime).format('YYYY-MM-DDTHH:mm') : '');
                    setFieldValue('notes', meetingData.notes || '');
                    
                    if (meetingData.related === "Contact") {
                        const result = await getApi(user.role === 'superAdmin' ? 'api/contact/' : `api/contact/?createBy=${user._id}`)
                        setContactData(result?.data || [])
                    } else if (meetingData.related === "Lead") {
                        const result = await getApi(user.role === 'superAdmin' ? 'api/lead/' : `api/lead/?createBy=${user._id}`)
                        setLeadData(result?.data || [])
                    }
                }
            } catch (e) {
                console.log(e);
                toast.error('Failed to fetch meeting data');
            } finally {
                setIsLoding(false)
            }
        }
    }

    useEffect(() => {
        if (values.related) {
            fetchAllData()
        }
    }, [props.id, values.related])

    useEffect(() => {
        if (editMode && editId) {
            formik.resetForm();
            setTimeout(() => {
                fetchMeetingData()
            }, 100);
        }
    }, [editMode, editId])

    useEffect(() => {
        if (editMode && values.related && values.related !== 'None') {
            fetchAllData()
        }
    }, [editMode, values.related])

    const extractLabels = (selectedItems) => {
        return selectedItems.map((item) => item._id);
    };

    const countriesWithEmailAsLabel = (values.related === "Contact" ? contactdata : leadData)?.map((item) => ({
        ...item,
        value: item._id,
        label: values.related === "Contact" ? `${item.fullName}` : item.leadName,
    }));

    return (
        <Modal onClose={() => {
            formik.resetForm();
            onClose();
        }} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent height={"580px"}>
                <ModalHeader>{editMode ? 'Edit Meeting' : 'Add Meeting'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody overflowY={"auto"} height={"400px"}>
                    {/* Contact Model  */}
                    <MultiContactModel data={contactdata} isOpen={contactModelOpen} onClose={setContactModel} fieldName='attendes' setFieldValue={setFieldValue} />
                    {/* Lead Model  */}
                    <MultiLeadModel data={leadData} isOpen={leadModelOpen} onClose={setLeadModel} fieldName='attendesLead' setFieldValue={setFieldValue} />

                    <Grid templateColumns="repeat(12, 1fr)" gap={3}>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Agenda<Text color={"red"}>*</Text>
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} onBlur={handleBlur}
                                value={values.agenda}
                                name="agenda"
                                placeholder='Agenda'
                                fontWeight='500'
                                borderColor={errors.agenda && touched.agenda ? "red.300" : null}
                            />
                            <Text fontSize='sm' mb='10px' color={'red'}> {errors.agenda && touched.agenda && errors.agenda}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }} >
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Related To<Text color={"red"}>*</Text>
                            </FormLabel>
                            <RadioGroup onChange={(e) => setFieldValue('related', e)} value={values.related}>
                                <Stack direction='row'>
                                    {props.leadContect === 'contactView' && <Radio value='Contact'>Contact</Radio>}
                                    {props.leadContect === 'leadView' && <Radio value='Lead'>Lead</Radio>}
                                    {!props.leadContect && <> <Radio value='Contact'>Contact</Radio><Radio value='Lead'>Lead</Radio></>}
                                </Stack>
                            </RadioGroup>
                            <Text mb='10px' color={'red'} fontSize='sm'> {errors.related && touched.related && errors.related}</Text>
                        </GridItem>
                        {(values.related === "Contact" ? (contactdata?.length ?? 0) > 0 : (leadData?.length ?? 0) > 0) && values.related &&

                            <GridItem colSpan={{ base: 12 }}>
                                <Flex alignItems={'end'} justifyContent={'space-between'} >
                                    <Text w={'100%'} >
                                        <CUIAutoComplete
                                            label={`Choose Preferred Attendes ${values.related === "Contact" ? "Contact" : values.related === "Lead" && "Lead"}`}
                                            placeholder="Type a Name"
                                            name="attendes"
                                            items={countriesWithEmailAsLabel}
                                            className='custom-autoComplete'
                                            selectedItems={countriesWithEmailAsLabel?.filter((item) => values.related === "Contact" ? values?.attendes.includes(item._id) : values.related === "Lead" && values?.attendesLead.includes(item._id))}
                                            onSelectedItemsChange={(changes) => {
                                                const selectedLabels = extractLabels(changes.selectedItems);
                                                values.related === "Contact" ? setFieldValue('attendes', selectedLabels) : values.related === "Lead" && setFieldValue('attendesLead', selectedLabels)
                                            }}
                                        />
                                    </Text>
                                    <IconButton mb={6} onClick={() => values.related === "Contact" ? setContactModel(true) : values.related === "Lead" && setLeadModel(true)} fontSize='25px' icon={<LiaMousePointerSolid />} />
                                </Flex>
                                <Text color={'red'}> {errors.attendes && touched.attendes && errors.attendes}</Text>
                            </GridItem>
                        }
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Location
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                onChange={handleChange} onBlur={handleBlur}
                                value={values.location}
                                name="location"
                                placeholder='Location'
                                fontWeight='500'
                                borderColor={errors.location && touched.location ? "red.300" : null}
                            />
                            <Text mb='10px' color={'red'} fontSize='sm'> {errors.location && touched.location && errors.location}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Date Time<Text color={"red"}>*</Text>
                            </FormLabel>
                            <Input
                                fontSize='sm'
                                type='datetime-local'
                                onChange={handleChange} onBlur={handleBlur}
                                min={dayjs(todayTime).format('YYYY-MM-DD HH:mm')}
                                value={values.dateTime}
                                name="dateTime"
                                placeholder='Date Time'
                                fontWeight='500'
                                borderColor={errors.dateTime && touched.dateTime ? "red.300" : null}
                            />
                            <Text fontSize='sm' mb='10px' color={'red'}> {errors.dateTime && touched.dateTime && errors.dateTime}</Text>
                        </GridItem>
                        <GridItem colSpan={{ base: 12 }}>
                            <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' mb='8px'>
                                Notes
                            </FormLabel>
                            <Textarea
                                resize={'none'}
                                fontSize='sm'
                                placeholder='Notes'
                                onChange={handleChange} onBlur={handleBlur}
                                value={values.notes}
                                name="notes"
                                fontWeight='500'
                                borderColor={errors.notes && touched.notes ? "red.300" : null}
                            />
                            <Text mb='10px' color={'red'}> {errors.notes && touched.notes && errors.notes}</Text>
                        </GridItem>

                    </Grid>


                </ModalBody>
                <ModalFooter>
                    <Button size="sm" variant='brand' me={2} disabled={isLoding ? true : false} onClick={handleSubmit}>{isLoding ? <Spinner /> : editMode ? 'Update' : 'Save'}</Button>
                    <Button sx={{
                        textTransform: "capitalize",
                    }} variant="outline"
                        colorScheme="red" size="sm" onClick={() => {
                            formik.resetForm()
                            onClose()
                        }}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default AddMeeting

